import * as React from 'react';
import { Link, Redirect, RouteComponentProps } from 'react-router-dom';
import { Spin, Icon, Button, Form, notification, Input, Col } from 'antd';

// amplify
import { Auth } from 'aws-amplify';

/** Presentational */
import FullWidthWrapper from '../../Components/FullWidthWrapper';
import EmailConfirmFormWrapper from '../../Components/ConfirmEmailWrapper';

type State = {
  username: string;
  email: string;
  loading: boolean;
  redirect: boolean;
  confirmationCode: string;
  error: string;
};

class ConfirmEmailContainer extends React.Component<RouteComponentProps, State> {
  state = {
    username: '',
    email: '',
    loading: false,
    redirect: false,
    confirmationCode: '',
    error: ''
  };

  async componentDidMount() {
    if (this.props.location.search) {
      const params = this.props.location.search.split('&').reduce((map, param) => {
        const [key, value] = param.split('=');
        return {
          ...map,
          [key]: value
        };
      }, {} as Record<string, string>);

      const { username, email } = params;
      this.setState({ username, email });
    }
  }

  handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const { confirmationCode, username } = this.state;

    // show progress spinner
    this.setState({ loading: true });

    Auth.confirmSignUp(username, confirmationCode)
      .then(() => {
        this.handleOpenNotification('success', 'Succesfully confirmed!', 'You will be redirected to login in a few!');
      })
      .catch(err => {
        this.handleOpenNotification('error', 'Invalid code', err.message);
        this.setState({
          loading: false
        });
      });
  };

  /**
   * @returns {void} - no value returned
   */
  handleOpenNotification = (type: string, title: string, message: string): void => {
    switch (type) {
      case 'success':
        notification['success']({
          message: title,
          description: message,
          placement: 'topRight',
          duration: 1.5,
          onClose: () => {
            this.setState({ redirect: true });
          }
        });
        break;

      case 'error':
        notification['error']({
          message: title,
          description: message,
          placement: 'topRight',
          duration: 1.5
        });
        break;
    }
  };

  handleOnPaste = (event: React.ClipboardEvent) => {
    event.preventDefault();

    const code = event.clipboardData.getData('Text').trim();

    /** Update input */
    this.setState({ confirmationCode: code });

    // regex to check if string is numbers only
    const reg = new RegExp('^[0-9]+$');

    if (reg.test(code) && code.length === 6) {
      // code is a valid number

      this.setState({ loading: true });

      Auth.confirmSignUp(this.state.username, code)
        .then(() => {
          this.handleOpenNotification('success', 'Succesfully confirmed!', 'You will be redirected to login in a few!');
        })
        .catch(err => {
          this.handleOpenNotification('error', 'Invalid code', err.message);
          this.setState({
            loading: false
          });
        });
    }
  };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ confirmationCode: event.currentTarget.value });
  };

  resendCode = async (event: React.MouseEvent) => {
    event.preventDefault();

    const { username } = this.state;
    await Auth.resendSignUp(username);
  }

  render() {
    const { loading, error, confirmationCode, redirect } = this.state;

    return (
      <FullWidthWrapper align="center">
        <EmailConfirmFormWrapper onSubmit={this.handleSubmit}>
          <Col md={24} lg={18}>
            <div className="full-width">
              <h2>Check your email</h2>
              <p>We've sent a six digit confirmation code</p>
            </div>
            <Form.Item validateStatus={error && 'error'} help={error} label="Confirmation Code">
              <Input
                size="large"
                type="number"
                placeholder="Enter confirmation code"
                onChange={this.handleChange}
                onPaste={this.handleOnPaste}
                value={confirmationCode}
              />
            </Form.Item>
          </Col>
          <Col md={24} lg={12}>
            <Button type="primary" disabled={loading} htmlType="submit" size="large">
              {loading ? <Spin indicator={<Icon type="loading" style={{ fontSize: 24 }} spin/>}/> : 'Confirm Email'}
            </Button>
          </Col>
          <Col lg={24}>
            <Link to="#" onClick={this.resendCode}>Resend code</Link>
          </Col>
        </EmailConfirmFormWrapper>
        {redirect && <Redirect to={{ pathname: '/login' }}/>}
      </FullWidthWrapper>
    );
  }
}

export default ConfirmEmailContainer;
