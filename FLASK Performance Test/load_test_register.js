import { check } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';

// Load random data from a shared array
const users = new SharedArray('users', function() {
  return JSON.parse(open('./users.json'));  // Assuming users.json is a file with random user data
});

export let options = {
  stages: [
//    { duration: '0s', target: 10 },  // ramp up to 50 users in 30 seconds
    { duration: '1s', target: 10 },   // ramp up 10 users in 1 s
//    { duration: '0s', target: 0 },   // ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% of requests should be under 500ms
  },
};

export default function () {
  let user = users[Math.floor(Math.random() * users.length)];  // pick random user data

  let payload = {
    fullName: user.fullName,
    userName: user.userName,
    email: user.email,
    password: user.password,
    phone: user.phone,
  };

  let res = http.post('http://localhost:5000/client_registeration', payload);
  
  check(res, {
    'register status 200': (r) => r.status === 200,
//    'body contains User Registered message': (r) => JSON.parse(r.body).msg === 'User Registered',
  });
}