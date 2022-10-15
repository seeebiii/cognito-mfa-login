import * as React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

/** Container components */
import LoginContainer from '../Containers/LoginContainer';
import SignupContainer from '../Containers/SIgnupContainer';
import ConfirmEmailContainer from '../Containers/VerifyEmailContainer';
import DashBoardContainer from '../Containers/DashboardContainer';
import ForgotPasswordContainer from '../Containers/ForgotPasswordContainer';

class AppRouter extends React.Component {
  render() {
    return (
      <Router>
        <React.Fragment>
          <Route exact={true} path="/" component={LoginContainer}/>
          <Route path="/login" component={LoginContainer}/>
          <Route path="/forgotPassword" component={ForgotPasswordContainer}/>
          <Route path="/signup" component={SignupContainer}/>
          <Route path="/verify-code" component={ConfirmEmailContainer}/>
          <Route path="/dashboard" component={DashBoardContainer}/>
        </React.Fragment>
      </Router>
    );
  }
}

export default AppRouter;
