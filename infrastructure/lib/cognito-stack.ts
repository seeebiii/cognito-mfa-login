import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AccountRecovery,
  Mfa, OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  UserPoolOperation
} from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { CfnOutput, Duration } from 'aws-cdk-lib';

export class CognitoStack extends cdk.Stack {
  readonly userPool: UserPool;
  readonly client: UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = this.createUserPool();
    this.client = this.createUserPoolClient();
    this.addUserPoolTriggers(this.userPool);

    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.client.userPoolClientId,
    });
  }

  private createUserPool() {
    return new UserPool(this, 'UserPool', {
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      mfa: Mfa.OPTIONAL,
      signInAliases: {
        username: true,
        email: true,
      },
      signInCaseSensitive: false,
      selfSignUpEnabled: true,
    });
  }

  private createUserPoolClient() {
    return this.userPool.addClient('UserPoolClient', {
      authFlows: {
        userSrp: true,
        custom: true,
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      oAuth: {
        callbackUrls: ['http://localhost:3000/'],
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: false,
        },
        logoutUrls: ['http://localhost:3000/'],
        scopes: [OAuthScope.EMAIL, OAuthScope.PROFILE, OAuthScope.PROFILE],
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.hours(1),
    });
  }

  private addUserPoolTriggers(userPool: UserPool) {
    userPool.addTrigger(UserPoolOperation.DEFINE_AUTH_CHALLENGE, new NodejsFunction(this, 'DefineAuthChallenge', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.resolve(__dirname, 'lambda/define-auth-challenge.ts')
    }));

    userPool.addTrigger(UserPoolOperation.CREATE_AUTH_CHALLENGE, new NodejsFunction(this, 'CreateAuthChallenge', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.resolve(__dirname, 'lambda/create-auth-challenge.ts')
    }));

    userPool.addTrigger(UserPoolOperation.VERIFY_AUTH_CHALLENGE_RESPONSE, new NodejsFunction(this, 'VerifyAuthChallenge', {
      runtime: Runtime.NODEJS_16_X,
      entry: path.resolve(__dirname, 'lambda/verify-auth-challenge.ts')
    }));
  }
}
