import * as proctoring from "https://sdk.web.proctor.constructor.app/proctoring.js";
import { SignJWT } from "https://cdn.skypack.dev/jose";

const JWT_SECRET = "7TO1Y4MSnb0p";
const ACCOUNT_NAME = "Digival Solutions";
const ACCOUNT_ID = "123";

const serverOrigin = "https://demo.proctor.constructor.app";
const integrationName = "digi-val-test";

const encoder = new TextEncoder();

function generateId(len = 8) {
  return crypto.randomUUID().replace(/-/g, "").slice(0, len);
}

function getUserData() {
  return {
    userId: generateId(7),
    lastName: "lastname",
    firstName: "firstname",
    thirdName: "thirdname",
    language: "en",
  };
}

function getOrganizationData() {
  return {
    accountId: ACCOUNT_ID,
    accountName: ACCOUNT_NAME,
  };
}

function getExamData() {
  const start = new Date();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    duration: 120,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    examId: generateId(8),
    examName: "test simple integration",
    identification: document.getElementById("identification").value,
    proctoring: document.getElementById("proctoring").value,
    auxiliaryCamera: document.getElementById("auxiliaryCamera").checked,
    auxiliaryCameraMode: document.getElementById("auxiliaryCameraMode").value,
    secureBrowser: document.getElementById("secureBrowser").checked,
    secureBrowserLevel: document.getElementById("secureBrowserLevel").value,

    schedule: false,
    allowMultipleDisplays: false,
  };
}

function getSessionData() {
  const sessionId = crypto.randomUUID();
  return {
    sessionId,
    sessionUrl:
      "https://demo.proctor.constructor.app/dashboard/video/" + sessionId,
  };
}

async function buildToken() {
  const payload = {
    ...getUserData(),
    ...getOrganizationData(),
    ...getExamData(),
    ...getSessionData(),
  };

  console.log("📦 Payload:", payload);

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(encoder.encode(JWT_SECRET));

  return jwt;
}

async function startProctoring(jwt) {
  let session = await proctoring.init({
    serverOrigin,
    integrationName,
    jwt,
  });

  session.examStarted.then(() => {
    console.log("exam started");
    document.getElementById("examContent").style.display = "block";
  });

  session.examFinished.then(() => {
    console.log("exam finished");
  });

  session.videoUploaded.then(() => {
    console.log("video uploaded");
  });
}

document
  .getElementById("startProctoringButton")
  .addEventListener("click", async () => {
    const jwt = await buildToken();

    console.log("🔐 JWT:", jwt);

    await startProctoring(jwt);
  });
