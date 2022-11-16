import { CreateAuthChallengeTriggerEvent } from 'aws-lambda';

export const handler = async (event: CreateAuthChallengeTriggerEvent): Promise<CreateAuthChallengeTriggerEvent> => {
  console.log(JSON.stringify(event));

  if (event.request.session.length > 1 && event.request.challengeName == 'CUSTOM_CHALLENGE') {
    event.response.publicChallengeParameters = {};
    event.response.publicChallengeParameters.type = 'CAPTCHA_CHALLENGE'
    event.response.privateChallengeParameters = {};
    event.response.privateChallengeParameters.answer = '123456';
    event.response.challengeMetadata = 'CAPTCHA_CHALLENGE';
  }

  return event;
};
