import * as React from 'react';
import { Redirect, Link, RouteComponentProps } from 'react-router-dom';
import Amplify from 'aws-amplify'
import Auth from '@aws-amplify/auth'
import { Form, Icon, Spin, Input, Button, notification, Col, Row } from 'antd';
import UserPoolData from '../../Assets/config';
import FormWrapper from '../../Components/FormWrapper';

Amplify.configure({
  Auth: {
    userPoolWebClientId: UserPoolData.clientId,
    userPoolId: UserPoolData.userPoolId,
    authenticationFlowType: UserPoolData.authFlowType || 'USER_SRP_AUTH',
  }
});

type Props = RouteComponentProps & {
  form: any;
};

enum ChallengeName {
  TOTP = 'SOFTWARE_TOKEN_MFA',
  SMS = 'SMS_MFA',
  CUSTOM = 'CUSTOM_CHALLENGE',
}

type State = {
  loading: boolean;
  cognitoUser: any;
  redirect: boolean;
  requireToken: boolean;
  challengeName: ChallengeName
};

class LoginContainer extends React.Component<Props, State> {
  state = {
    loading: false,
    cognitoUser: {},
    redirect: false,
    requireToken: false,
    challengeName: ChallengeName.TOTP
  };

  async componentDidMount() {
    const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
    if (currentAuthenticatedUser) this.setState({ redirect: true });
  }

  handleSubmitMFA = (event: React.FormEvent) => {
    event.preventDefault();

    this.props.form.validateFields(async (err: Error, values: { token: string }) => {
      if (!err) {
        const { token } = values;
        const { cognitoUser, challengeName } = this.state;

        this.setState({ loading: true });

        let loggedInUser;
        if (challengeName === 'CUSTOM_CHALLENGE') {
          loggedInUser = await Auth.sendCustomChallengeAnswer(cognitoUser, token);
        } else {
          loggedInUser = await Auth.confirmSignIn(
            cognitoUser,
            token,
            challengeName
          );
        }

        console.log(`logged in: ${JSON.stringify(loggedInUser)}`);
        this.setState({ loading: false, cognitoUser: loggedInUser });

        notification.success({
          message: 'Succesfully logged in user!',
          description: 'Logged in successfully. Redirecting you now...',
          placement: 'topRight',
          duration: 1.5,
          onClose: () => {
            this.setState({ redirect: true });
          }
        });
      }
    });
  }

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    this.props.form.validateFields(async (err: Error, values: { username: string; password: string }) => {
      if (!err) {
        try {
          const { username, password } = values;

          this.setState({ loading: true });
          const user = await Auth.signIn(username, password);
          this.setState({ loading: false, cognitoUser: user });

          if (user.challengeName === 'SOFTWARE_TOKEN_MFA' || user.challengeName === 'SMS_MFA' || user.challengeName === 'CUSTOM_CHALLENGE') {
            this.setState({ loading: false, requireToken: true, challengeName: user.challengeName });
          }
          this.setState({ loading: false });
        } catch (err) {
          console.log(`Error happened when logging in: `, err);
          this.setState({ loading: false });
        }
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, redirect } = this.state;

    return (
      <React.Fragment>
        {!this.state.requireToken && (
          <FormWrapper onSubmit={this.handleSubmit} className="login-form">
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your username!'
                  }
                ]
              })(
                <Input prefix={<Icon type="user" style={{ color: '#000000' }}/>} placeholder="Username"/>
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your password!'
                  }
                ]
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: '#000000' }}/>}
                  type="password"
                  placeholder="Password"
                />
              )}
            </Form.Item>
            <Form.Item className="text-center">
              <Row type="flex" gutter={16}>
                <Col lg={24}>
                  <Button
                    style={{ width: '100%' }}
                    type="primary"
                    disabled={loading}
                    htmlType="submit"
                    className="login-form-button"
                  >
                    {loading ? <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin/>}/> : 'Log in'}
                  </Button>
                </Col>
                <Col lg={24}>
                  <Link to="/signup">Register now</Link> | <Link to="/forgotPassword">Forgot password?</Link>
                </Col>
              </Row>
            </Form.Item>
          </FormWrapper>
        )}
        {this.state.requireToken && (
          <FormWrapper onSubmit={(event) => this.handleSubmitMFA(event)} className="login-form">
            <Form.Item>
              {getFieldDecorator('token', {
                rules: [
                  {
                    required: true,
                    message: 'Please input token!'
                  }
                ]
              })(
                <Input prefix={<Icon type="user" style={{ color: '#000000' }}/>} placeholder="Token"/>
              )}
            </Form.Item>
            <Form.Item className="text-center">
              <Row type="flex" gutter={16}>
                <Col lg={24}>
                  <Button
                    style={{ width: '100%' }}
                    type="primary"
                    disabled={loading}
                    htmlType="submit"
                    className="login-form-button"
                  >
                    {loading ? <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin/>}/> : 'Log in'}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </FormWrapper>)}
        {redirect && <Redirect to={{ pathname: '/dashboard' }}/>}
      </React.Fragment>
    );
  }
}

export default Form.create()(LoginContainer);
