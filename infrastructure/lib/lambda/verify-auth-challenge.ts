import { VerifyAuthChallengeResponseTriggerEvent } from 'aws-lambda';

export const handler = async (event: VerifyAuthChallengeResponseTriggerEvent): Promise<VerifyAuthChallengeResponseTriggerEvent> => {
  console.log(JSON.stringify(event));

  event.response.answerCorrect = event.request.privateChallengeParameters.answer == event.request.challengeAnswer;

  return event;
};
