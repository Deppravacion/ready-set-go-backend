import bcrypt from "bcrypt";

const jonsHashedPassword =
  "$2b$11$pDGvO76bnAV2rPlie30FWeH1sNOq7PsMy0qCM2avVI1wt5P5q7y.W";
const petersHashedPassword =
  "$2b$11$APHbwJb.xcwa2o5hjTeYTufwbykKzV5FA77TlLnsSHvHXt5ojUnoq";

bcrypt.compare("jonspassword", jonsHashedPassword).then((result) => {
  console.log({ result: result });
});
