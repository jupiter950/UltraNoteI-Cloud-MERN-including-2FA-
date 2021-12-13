import React, { useEffect } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
/// Components
import Markup from "./jsx";

/// Style
import "./vendor/bootstrap-select/dist/css/bootstrap-select.min.css";
import "./css/style.css";
import { connect } from "react-redux";
import { withResizeDetector } from "react-resize-detector";
import LoginPage from "./pages/Login";
import ThemeContextProvider from "./context/ThemeContext";
import DashboardPage from "./pages/dashboard";
import ProfilePage from "./pages/profile";
import RegisterPage from "./pages/Register";
import UserList from "./pages/UserManagement/UserList";
import UserEdit from "./pages/UserManagement/UserEdit";
import ForgotPasswordPage from "./pages/forgotpassword";
import { createStructuredSelector } from "reselect";
import ResetPasswordPage from "./pages/resetpassword";
import GoogleAuthEmailPage from "./pages/GoogleEmail";
import GoogleAuthEnticatorSecretCodePage from "./pages/GoogleAuthticatorSecretCode";
import { selectUserToken } from "./redux/user/user.selectors";
import MassEmailPage from "./pages/MassEmail/MassEmail";

// import {setCurrentUser} from './redux/user/user.actions';
const App = ({ width, token }) => {
  const body = document.querySelector("body");
  //useEffect(() => {
  //   body.setAttribute("data-typography", "poppins");
  //   body.setAttribute("data-theme-version", "light");
  //   body.setAttribute("data-layout", "vertical");
  //   body.setAttribute("data-nav-headerbg", "color_1");
  //   body.setAttribute("data-headerbg", "color_1");
  //   body.setAttribute("data-sidebar-style", "overlay");
  //   body.setAttribute("data-sibebarbg", "color_1");
  //   body.setAttribute("data-primary", "color_1");
  //   body.setAttribute("data-sidebar-position", "fixed");
  //   body.setAttribute("data-header-position", "fixed");
  //   body.setAttribute("data-container", "wide");
  //   body.setAttribute("direction", "ltr");

  //   width >= 768 && width < 1300
  //     ? body.setAttribute("data-sidebar-style", "mini")
  //     : width <= 768
  //     ? body.setAttribute("data-sidebar-style", "overlay")
  //     : body.setAttribute("data-sidebar-style", "full");
  // }, [width]);

  return (
    <ThemeContextProvider>
      <Switch>
        <Route path="/register" component={RegisterPage} />
        <Route
          exact
          path="/"
          render={() => (token ? <Redirect to="/dashboard" /> : <LoginPage />)}
        />
        <Route
          exact
          path="/dashboard"
          render={() => (token ? <DashboardPage /> : <Redirect to="/" />)}
        />
        <Route
          exact
          path="/profile-details"
          render={() => (token ? <ProfilePage /> : <Redirect to="/" />)}
        />
        <Route
          exact
          path="/users"
          render={() => (token ? <UserList /> : <Redirect to="/" />)}
        />{" "}
        <Route
          path="/users/:id"
          render={(props) => {
            props.token = token ? token : null;
            return <UserEdit {...props} />;
          }}
        />
        <Route
          exact
          path="/mass-email"
          render={() =>
            token ? <MassEmailPage token={token.token} /> : <Redirect to="/" />
          }
        />
        <Route path="/forgotpassword" component={ForgotPasswordPage} />
        <Route
          path="/reset-password/:id/:token"
          component={ResetPasswordPage}
        />
        <Route path="/googleauthicator" component={GoogleAuthEmailPage} />
        <Route
          path="/googleverifycode"
          component={GoogleAuthEnticatorSecretCodePage}
        />
        {/* <Route path="/markmili" component={Markup} />  */}
      </Switch>
    </ThemeContextProvider>
  );
};

const mapStateToProps = createStructuredSelector({
  token: selectUserToken,
});
// const mapDispatchToProps = dispatch => ({
//   setCurrentUser:user => dispatch(setCurrentUser(user))
//   });

export default connect(mapStateToProps)(withResizeDetector(App));
