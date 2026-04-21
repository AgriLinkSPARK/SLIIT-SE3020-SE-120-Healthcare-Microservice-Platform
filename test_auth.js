import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://localhost:8001/api/auth/login', {
      email: 'gayan@example.com',
      password: 'password'
    });
    console.log(res.data);
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
