# cognito-mfa-login

> Original code from: https://github.com/bAssudani/cognito-mfa-login
> Code was modified to provide CDK infrastructure, use optional MFA & custom auth flow.
> 
> ⚠️ Don't expect bug-free code 😀

This is a pet project to play around with a few Cognito & Amplify features and figure out how it works.

## Features

- Deploy Cognito user pool, client and Lambda Triggers using CDK
  - Lambda triggers implement Custom Auth flow in Cognito
- Start a local React frontend using Amplify to test flows like register, login & forget password

## Development


### Infrastructure

```
cd infrastructure
npm install
cdk deploy
```

See [infrastructure/README.md](infrastructure/README.md) for more details.


### Frontend

```
cd frontend
npm install
npm run start
```

See [frontend/README.md](frontend/README.md) for more details.
