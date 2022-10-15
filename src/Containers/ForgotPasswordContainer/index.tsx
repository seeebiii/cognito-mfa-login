import * as React from 'react';
import { Redirect, Link, RouteComponentProps } from 'react-router-dom';
import Amplify, { Auth } from 'aws-amplify'
import { Form, Icon, Spin, Input, Button, Col, Row } from 'antd';
import UserPoolData from '../../Assets/config';
import FormWrapper from '../../Components/FormWrapper';

Amplify.configure({
  Auth: {
    userPoolWebClientId: UserPoolData.clientId,
    userPoolId: UserPoolData.userPoolId,
  }
})

type Props = RouteComponentProps & {
  form: any;
};

type State = {
  loading: boolean;
  redirect: boolean;
  codeSent: boolean;
};


class ForgotPasswordContainer extends React.Component<Props, State> {
  state = {
    loading: false,
    redirect: false,
    codeSent: true,
  };

  sendResetCode = (event: React.FormEvent) => {
    event.preventDefault();

    this.props.form.validateFields(async (err: Error, values: { username: string; }) => {
      if (!err) {
        const { username } = values;
        this.setState({ loading: true });
        await Auth.forgotPassword(username);
        this.setState({ codeSent: true });
      }
    });
  };

  resetPassword = (event: React.FormEvent) => {
    event.preventDefault();

    this.props.form.validateFields(async (err: Error, values: { username: string; code: string, newPassword: string }) => {
      if (!err) {
        const { username, code, newPassword } = values;
        this.setState({ loading: true });
        await Auth.forgotPasswordSubmit(username, code, newPassword);
        this.setState({ redirect: true });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, redirect, codeSent } = this.state;

    return (
      <React.Fragment>
        {!codeSent && (
          <FormWrapper onSubmit={this.sendResetCode} className="login-form">
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: 'Your username'
                  }
                ]
              })(
                <Input prefix={<Icon type="user" style={{ color: '#000000' }}/>} placeholder="Username"/>
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
                    {loading ?
                      <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin/>}/> : 'Reset password'}
                  </Button>
                </Col>
                <Col lg={24}>
                  <Link to="/login">Go back</Link>
                </Col>
              </Row>
            </Form.Item>
          </FormWrapper>
        )}
        {codeSent && (
          <FormWrapper onSubmit={this.resetPassword} className="login-form">
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: 'Your username'
                  }
                ]
              })(
                <Input prefix={<Icon type="user" style={{ color: '#000000' }}/>} placeholder="Username"/>
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('code', {
                rules: [
                  {
                    required: true,
                    message: 'Code'
                  }
                ]
              })(
                <Input prefix={<Icon type="number" style={{ color: '#000000' }}/>} placeholder="Code"/>
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('newPassword', {
                rules: [
                  {
                    required: true,
                    message: 'New password'
                  }
                ]
              })(
                <Input prefix={<Icon type="lock" style={{ color: '#000000' }}/>} type="password"
                       placeholder="Password"/>
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
                    {loading ?
                      <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin/>}/> : 'Reset password'}
                  </Button>
                </Col>
                <Col lg={24}>
                  <Link to="/login">Go back</Link>
                </Col>
              </Row>
            </Form.Item>
          </FormWrapper>
        )}
        {redirect && <Redirect to={{ pathname: '/login' }}/>}
      </React.Fragment>
    );
  }
}

export default Form.create()(ForgotPasswordContainer);
