import * as React from 'react';
import { Auth } from 'aws-amplify';
import { RouteComponentProps } from 'react-router';
import { Layout, Menu, Icon, notification } from 'antd';
import { ClickParam } from 'antd/lib/menu';
import { SelectMFAType } from 'aws-amplify-react';

type Props = RouteComponentProps & {
  form: any;
};

type UserInfo = {
  id: string;
  username: string;
}

type State = {
  collapsed: boolean;
  currentUser: UserInfo | undefined;
  currentAuthenticatedUser: any;
  currentMfaMethod: string;
};

const MFATypes = {
  SMS: true,
  TOTP: true,
  Optional: false,
}

class DashBoardContainer extends React.Component<Props, State> {

  state = {
    collapsed: false,
    currentUser: undefined,
    currentAuthenticatedUser: null,
    currentMfaMethod: '',
  } as State;

  async componentDidMount() {
    const currentUser = await Auth.currentUserInfo();
    const currentAuthenticatedUser = await Auth.currentAuthenticatedUser();
    const mfaMethod = await Auth.getPreferredMFA(currentAuthenticatedUser);
    this.setState({ currentUser: currentUser as UserInfo, currentAuthenticatedUser, currentMfaMethod: mfaMethod });
  }

  setCollapsed() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  handleLogout = async (event: ClickParam) => {
    const { history } = this.props;
    try {
      await Auth.signOut({ global: true }).then(() => {
        history.push('/login');
      });
    } catch (err) {
      notification.error({ message: err.message });
    }
  };

  render() {
    const { collapsed, currentUser } = this.state;
    return (
      <Layout className="cover" id="app-header">
        <Layout.Sider className="cover" trigger={null} collapsible collapsed={collapsed}>
          <div className="logo"/>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="home"/>
              <span>Home</span>
            </Menu.Item>
            <Menu.Item key="3" onClick={event => this.handleLogout(event)}>
              <Icon type="logout"/>
              <span>Logout</span>
            </Menu.Item>
          </Menu>
        </Layout.Sider>
        <Layout>
          <Layout.Header style={{ background: '#ffffff', padding: 10 }}>
            <Icon
              style={{ verticalAlign: 'super' }}
              className="trigger"
              onClick={() => this.setCollapsed()}
              type={collapsed ? 'menu-unfold' : 'menu-fold'}
            />
            <div
              style={{ verticalAlign: 'super', float: 'right', paddingRight: 10 }}
            ><h1> Hi {currentUser?.username}</h1>
            </div>
          </Layout.Header>
          <Layout.Content
            style={{
              margin: '24px 16px',
              padding: 24,
              background: '#ffffff',
              minHeight: 280
            }}
          >
            <div className="text-center">
              <h1>Dashboard</h1>
              <p>Current MFA
                method: {this.state.currentMfaMethod === 'NOMFA' ? 'No MFA' : this.state.currentMfaMethod}</p>
              <SelectMFAType authData={this.state.currentAuthenticatedUser} MFATypes={MFATypes}/>
            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    );
  };
}

export default DashBoardContainer;
