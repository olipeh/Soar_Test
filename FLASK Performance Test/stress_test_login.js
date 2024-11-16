import { check } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';



// Get random data from a shared array
const users = new SharedArray('users', function() {
  return JSON.parse(open('./users.json'));  // Assuming users.json is a file with random user data
});


export let options = {
  stages: [
    { duration: '1s', target: 10 },  // ramp up to 100 users in 1 minute
    { duration: '10s', target: 80 },  // keep at 100 users for 2 minutes
    { duration: '3s', target: 0 },    // ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'],  // 95% requests should be under 1000ms
  },
};

export default function () {

  let user = users[Math.floor(Math.random() * users.length)];  // pick random user data

  let payload = {
    userName: user.userName,
    email: user.email,
    password: user.password,
  };

  let res = http.post('http://localhost:5000/client_login', payload);
  
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
}
