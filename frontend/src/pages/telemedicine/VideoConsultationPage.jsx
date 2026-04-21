import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Camera, DoorOpen, Mic, MonitorPlay, Shield, Video } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import { endVideoSession, getVideoSessionById, startVideoSession } from '../../services/telemedicineService'
import { USER_ROLES } from '../../utils/constants'

const resolveDisplayName = (user) => {
  const candidates = [user?.fullName, user?.name, user?.firstName, user?.user?.fullName, user?.user?.name]
  return candidates.find((value) => typeof value === 'string' && value.trim()) || ''
}

const resolveEmail = (user) => {
  const candidates = [user?.email, user?.user?.email]
  return candidates.find((value) => typeof value === 'string' && value.trim()) || ''
}

const resolveUserId = (user) => {
  const candidates = [user?.userId, user?.id, user?._id, user?.patientId, user?.doctorId, user?.user?.userId, user?.user?.id, user?.user?._id, user?.user?.patientId, user?.user?.doctorId]
  return candidates.find((value) => typeof value === 'string' && value.trim()) || ''
}

const canAccessSession = (session, user, role) => {
  if (!session) return false
  if (role === USER_ROLES.ADMIN) return true

  const userId = resolveUserId(user)
  return userId === session.patientId || userId === session.doctorId
}

export default function VideoConsultationPage() {
  const { sessionId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const initialSession = location.state?.session || null
  const initialMeetingUrl = location.state?.meetingUrl || initialSession?.jitsiMeetLink || ''

  const [session, setSession] = useState(initialSession)
  const [meetingUrl, setMeetingUrl] = useState(initialMeetingUrl)
  const [loading, setLoading] = useState(true)
  const [ending, setEnding] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const meetingContainerRef = useRef(null)
  const jitsiApiRef = useRef(null)

  const displayName = useMemo(() => resolveDisplayName(user) || 'User', [user])
  const email = useMemo(() => resolveEmail(user), [user])
  const userRole = user?.role || user?.user?.role || ''

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setErrorMessage('Missing video session identifier.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setErrorMessage('')

        const sessionData = session?.sessionId === sessionId ? session : await getVideoSessionById(sessionId)

        if (!canAccessSession(sessionData, user, userRole)) {
          throw new Error('You are not allowed to access this consultation room.')
        }

        const meetUrl = await startVideoSession(sessionData.sessionId, {
          userDisplayName: displayName,
          userEmail: email,
        })

        setSession({
          ...sessionData,
          status: 'IN_PROGRESS',
        })
        setMeetingUrl(meetUrl)
      } catch (error) {
        setErrorMessage(error.response?.data?.message || error.message || 'Failed to open the consultation room')
      } finally {
        setLoading(false)
      }
    }

    // eslint-disable-next-line no-void
    loadSession()
  }, [displayName, email, sessionId, user, userRole])

  useEffect(() => {
    let cancelled = false

    const parseMeetingUrl = (url) => {
      if (typeof url !== 'string' || !url.trim()) {
        return null
      }

      const trimmed = url.trim()

      if (!/^https?:\/\//i.test(trimmed)) {
        const fallbackRoom = trimmed.replace(/^\/+/, '').replace(/^meet\.jit\.si\//i, '')
        if (!fallbackRoom) {
          return null
        }

        return {
          domain: 'meet.jit.si',
          roomName: fallbackRoom,
        }
      }

      try {
        const parsed = new URL(trimmed)
        const path = parsed.pathname.split('/').filter(Boolean)
        if (!path.length) return null

        const host = parsed.host
        const isJaas = host.includes('8x8.vc') && path.length >= 2
        const room = isJaas ? path.slice(1).join('/') : path.join('/')

        return {
          // Always use public Jitsi to avoid 8x8 JWT signature/auth errors.
          domain: 'meet.jit.si',
          roomName: room,
        }
      } catch {
        return null
      }
    }

    const loadJitsiScript = (domain) => new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve()
        return
      }

      const existing = document.querySelector('script[data-jitsi-external-api="true"]')
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true })
        existing.addEventListener('error', () => reject(new Error('Failed to load Jitsi script')), { once: true })
        return
      }

      const script = document.createElement('script')
  script.src = `https://${domain}/external_api.js`
      script.async = true
      script.dataset.jitsiExternalApi = 'true'
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Jitsi script'))
      document.body.appendChild(script)
    })

    const initMeeting = async () => {
      if (!meetingUrl || !meetingContainerRef.current) return

      const meeting = parseMeetingUrl(meetingUrl)
      if (!meeting) {
        setErrorMessage('Invalid meeting URL received from telemedicine service.')
        return
      }

      try {
        await loadJitsiScript(meeting.domain)
        if (cancelled || !meetingContainerRef.current) return

        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose()
          jitsiApiRef.current = null
        }

        const apiOptions = {
          roomName: meeting.roomName,
          parentNode: meetingContainerRef.current,
          userInfo: {
            displayName,
            email,
          },
          configOverwrite: {
            prejoinPageEnabled: true,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
          },
        }

        const api = new window.JitsiMeetExternalAPI(meeting.domain, apiOptions)

        api.addListener('videoConferenceLeft', () => {
          navigate(userRole === USER_ROLES.DOCTOR ? '/doctor/appointments' : '/patient/appointments')
        })

        jitsiApiRef.current = api
      } catch (error) {
        setErrorMessage(error.message || 'Unable to initialize live video consultation')
      }
    }

    initMeeting()

    return () => {
      cancelled = true
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
        jitsiApiRef.current = null
      }
    }
  }, [meetingUrl, displayName, email, navigate, userRole])

  const handleLeave = async () => {
    if (!session?.sessionId) {
      navigate(userRole === USER_ROLES.DOCTOR ? '/doctor/appointments' : '/patient/appointments')
      return
    }

    try {
      setEnding(true)
      await endVideoSession(session.sessionId)
      navigate(userRole === USER_ROLES.DOCTOR ? '/doctor/appointments' : '/patient/appointments')
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to end the consultation')
    } finally {
      setEnding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-slate-200 shadow-2xl backdrop-blur">
          Preparing secure consultation room...
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-lg rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-200">
            <AlertCircle size={20} />
            <h1 className="text-lg font-semibold">Video consultation unavailable</h1>
          </div>
          <p className="mt-3 text-sm leading-6 text-rose-100/90">{errorMessage}</p>
          <button
            type="button"
            onClick={() => navigate(userRole === USER_ROLES.DOCTOR ? '/doctor/appointments' : '/patient/appointments')}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft size={16} />
            Back to appointments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-4 p-4 lg:grid-cols-[1fr_340px] lg:p-6">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172a] shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/5 px-4 py-4 lg:px-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/70">Secure Consultation</p>
              <h1 className="mt-1 text-xl font-semibold text-white">{session?.roomName || 'Telemedicine room'}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5">
                <Shield size={14} />
                Authenticated access
              </span>
              <button
                type="button"
                onClick={handleLeave}
                disabled={ending}
                className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <DoorOpen size={15} />
                {ending ? 'Ending...' : 'Leave session'}
              </button>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
            <div className="min-h-[72vh] bg-black">
              {meetingUrl ? (
                <div
                  ref={meetingContainerRef}
                  className="h-[72vh] w-full"
                />
              ) : (
                <div className="flex h-[72vh] items-center justify-center text-sm text-slate-300">
                  Consultation room is loading...
                </div>
              )}
            </div>

            <aside className="border-t border-white/10 bg-white/5 p-4 lg:border-l lg:border-t-0 lg:p-5">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Participants</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-200">
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="flex items-center gap-2 text-cyan-200"><Video size={16} /> Doctor</div>
                      <p className="mt-2 font-medium">{session?.doctorName || session?.doctorId || 'Assigned doctor'}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="flex items-center gap-2 text-cyan-200"><Camera size={16} /> Patient</div>
                      <p className="mt-2 font-medium">{session?.patientName || session?.patientId || 'Assigned patient'}</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="flex items-center gap-2 text-cyan-200"><Mic size={16} /> Status</div>
                      <p className="mt-2 font-medium">{session?.status || 'IN_PROGRESS'}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-slate-900 p-4 text-sm text-slate-200">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <MonitorPlay size={16} />
                    Session details
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-400">Appointment</dt>
                      <dd className="text-right font-medium text-white">{session?.appointmentId || '-'}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-400">Duration</dt>
                      <dd className="text-right font-medium text-white">{session?.durationMinutes || 30} min</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-400">Room</dt>
                      <dd className="break-all text-right font-medium text-white">{session?.roomName || '-'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}