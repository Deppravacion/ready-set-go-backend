import bcrypt from "bcrypt";

const jonsHashedPassword =
  "$2b$11$pDGvO76bnAV2rPlie30FWeH1sNOq7PsMy0qCM2avVI1wt5P5q7y.W";
const petersHashedPassword =
  "$2b$11$APHbwJb.xcwa2o5hjTeYTufwbykKzV5FA77TlLnsSHvHXt5ojUnoq";

const userToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRAZC5jb20iLCJpYXQiOjE3MjgyMjgzMzR9.rxOcEyVRQ5O7J66AJbTIeNclG4kd4ZAEHSA8-wJWAnk";

const newToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRAZC5jb20iLCJpYXQiOjE3MjgyMjg1NDZ9.OkaM66HHpTyj0y8_D4xv5UImcpsWYzFc5j-W3eDkOU0";
bcrypt.compare("jonspassword", jonsHashedPassword).then((result) => {
  console.log({ result: result });
});
