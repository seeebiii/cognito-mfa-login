import { DefineAuthChallengeTriggerEvent } from 'aws-lambda';

export const handler = async (event: DefineAuthChallengeTriggerEvent): Promise<DefineAuthChallengeTriggerEvent> => {
  console.log(JSON.stringify(event));

  const session = event.request.session;
  const sessionLength = session.length;

  if (sessionLength == 1 && session[0].challengeName == 'SRP_A') {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'PASSWORD_VERIFIER';
  } else if (sessionLength == 2 && session[1].challengeName == 'PASSWORD_VERIFIER' && session[1].challengeResult) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  } else if (sessionLength == 3 && session[2].challengeName == 'CUSTOM_CHALLENGE' && session[2].challengeResult) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }

  return event;
};
