import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import cookie from 'js-cookie';
import { takeLatest, call, put, all } from 'redux-saga/effects';
import { clientHttp } from '../../utils/services/httpClient';
import {
    loginFailure,
    signupFailure,
    signupSuccess,
    loginSuccess,
    enableTwoAuthSuccess,
    sendTwoCodeFailure,
    sendTwoCodeSuccess,
    updateProfileSuccess,
    updateProfileFailure,
    depositAndWithdrawSuccess,
    authResetSuccess,
    addContactSuccess,
    deleteContactSuccess,
    userActivitySuccess,
    throwError,
    changeCurrencySuccess,
    auth2FATMPSuccess,
    auth2FAConfirmSuccess,
    getUserSuccess
} from './auth.actions';

import AuthTypes from './auth.types';

export function* signupStartAsync({ payload }) {
    try {
        const requestData = {
            firstName: payload.firstName,
            lastName: payload.lastName,
            mail: payload.email,
            // phone: payload.phone,
            password: payload.password
        };
        const result = yield clientHttp.post('/signup', requestData);
        if (result && result.data) {
            payload.history.push('/login');
            toast.success('Account created successfully, We have sent an email with a confirmation link to your email address.');
            yield put(signupSuccess());
        }
    }
    catch (error) {
        yield put(signupFailure(error));
    }
}

export function* onSignupStart() {
    yield takeLatest(AuthTypes.SIGNUP_START, signupStartAsync);
}

export function* loginStartAsync({ payload }) {
    try {
        const { setSocket } = payload;
        const requestData = {
            mail: payload.email,
            password: payload.password
        };

        const result = yield clientHttp.post('/signin', requestData);
        if (result && result.data) {
            const { otp_auth ,twoFA, token } = result.data;
            if ((twoFA == true && otp_auth == true) || otp_auth == true) {
                toast.info('OTP verication code is sent to your email');
                payload.history.push(`/confirm-code/${token}`);
            }else if(twoFA == true) {
                toast.info('2FA verication code');
                payload.history.push(`/confirm-2FA-code/${token}`);
            }
            else {
                cookie.set('Auth', true);
                yield put(loginSuccess(result.data));
                //localStorage.setItem('user', JSON.stringify(result.data.user));
                localStorage.setItem('token', result.data.token);
                toast.success('Successfully login');
                payload.history.push('/dashboard');
                if (setSocket) {
                    try {
                        const socketConnectionOptions = { transportOptions: { polling: { extraHeaders: { Authorization: `Bearer ${result.data.token}` || '' } } }, path: '/api/socket' };
                        const socketConnection = io('https://cloud.ultranote.org', socketConnectionOptions);
                        setSocket(socketConnection);
                    } catch (err) {
                        console.log('Error in socket connection', err);
                    }
                }
            }
        }
    }
    catch (error) {
        yield put(loginFailure(error));
    }
}

export function* onLoginStart() {
    yield takeLatest(AuthTypes.LOGIN_START, loginStartAsync);
}


export function* resetPasswordAsync({ payload }) {
    const requestData = {
        password: payload.password
    };
    const token = payload.token;

    try {
        const result = yield clientHttp.post(`/newpassword/${token}`, requestData);
        if (result) {
            toast.success("Password successfuly updated");
            const { history } = payload;
            history.push('/login');
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}


export function* onResetPasswordStart() {
    yield takeLatest(AuthTypes.RESET_PASSWORD, resetPasswordAsync);
}

export function* UpdateProfileAsync({ payload }) {
    const requestData = {
        image: payload.image,
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
    };
    const token = payload.token;

    try {
        const result = yield clientHttp.post(`/update_profile/${token}`, requestData);
        if (result) {
            yield put(updateProfileSuccess(result.data.userData));
            toast.success("Profile Successfuly Updated");
        }
    }
    catch (error) {
        yield put(updateProfileFailure(error));
    }
}


export function* onUpdateProfileStart() {
    yield takeLatest(AuthTypes.UPDATE_PROFILE_START, UpdateProfileAsync);
}

export function* requestEmailResetAsync({ payload }) {
    const requestData = {
        mail: payload.email
    };

    try {
        const result = yield clientHttp.post('/resetmail', requestData);
        if (result) {
            toast.info("You should soon receive an email allowing you to reset your password. Please make sure to check your spam and trash if you can't find the email.");
            const { history } = payload;
            history.push('/');
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}


export function* onRequestEmailResetPasswordStart() {
    yield takeLatest(AuthTypes.REQUEST_EMAIL_RESET, requestEmailResetAsync);
}


export function* enableTwoAuthAsync({ payload }) {
    try {
        const result = yield clientHttp.post('/user/change2fa', payload);
        if (result) {
            const msg = payload.isActive ? 'Authenticator app is enabled' : 'Authenticator app is disabled';
            toast.success(msg);
            yield put(enableTwoAuthSuccess(payload))
        }
    }
    catch (error) {
        yield put(enableTwoAuthFailure(error));
    }
}


export function* onEnableTwoAuth() {
    yield takeLatest(AuthTypes.ENABLE_TWO_AUTH, enableTwoAuthAsync);
}

export function* changeCurrencyAsync({ payload }) {
    try {
        const result = yield clientHttp.post('/user/change_currency', payload);
        if (result) {
            yield put(changeCurrencySuccess(payload))
            toast.success("Currency Changed Successfully");
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}


export function* onChangeCurrency() {
    yield takeLatest(AuthTypes.CHANGE_CURRENCY, changeCurrencyAsync);
}

export function* sendTwoAuthVerifAsync({ payload }) {

    try {
        const requestData = {
            code: payload.code,
        }
        const result = yield clientHttp.post(`/twofacode/${payload.token}`, requestData);
        if (result && result.data) {

            const { user, token } = result.data;
            cookie.set('Auth', true);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('token', result.data.token);
            toast.success('Successfully login');
            yield put(sendTwoCodeSuccess({ user, token }));
            payload.history.push('/dashboard');
            
        }
    }
    catch (error) {
        console.log("error", error);
        yield put(sendTwoCodeFailure(error));
    }
}

export function* sendOtpAuthVerifAsync({ payload }) {

    try {
        const requestData = {
            code: payload.code,
        }
        const result = yield clientHttp.post(`/otp/${payload.token}`, requestData);
        if (result && result.data) {

            const { user, token } = result.data;
            if(user.two_auth == true){
                toast.info('2FA verication code');
                payload.history.push(`/confirm-2FA-code/${token}`);
            }
            else {
                cookie.set('Auth', true);
                localStorage.setItem('user', JSON.stringify(result.data.user));
                localStorage.setItem('token', result.data.token);
                toast.success('Successfully login');
                yield put(sendTwoCodeSuccess({ user, token }));
                payload.history.push('/dashboard');
            }
        }
    }
    catch (error) {
        console.log("error", error);
        yield put(sendTwoCodeFailure(error));
    }
}


export function* onSendTwoAuthVerif() {
    yield takeLatest(AuthTypes.SEND_CODE_TWO_AUTH, sendTwoAuthVerifAsync);
}
export function* onSendOtpAuthVerif() {
    yield takeLatest(AuthTypes.SEND_CODE_OTP_AUTH, sendOtpAuthVerifAsync);
}

export function* DepositAndWithdrawAsync({ payload }) {
    try {
        const result = yield clientHttp.post(`/user/dashboard`, { id: payload });
        if (result && result.data) {
            yield put(depositAndWithdrawSuccess(result.data));
        }
    }
    catch (error) {
        console.log(error);
    }
}


export function* onDepositAndWithdraw() {
    yield takeLatest(AuthTypes.DEPOSIT_AND_WITHDRAW_START, DepositAndWithdrawAsync);
}


export function* authResetAsync() {
    try {
        console.log('Reset Auth States');
        yield put(authResetSuccess());
    }
    catch (error) {
        yield put(throwError(error));
    }
}

export function* onAuthReset() {
    yield takeLatest(AuthTypes.AUTH_RESET, authResetAsync);
}


export function* addContactAsync({ payload }) {
    try {
        const result = yield clientHttp.post(`/user/add_contact`, payload);
        if (result && result.data) {
            toast.success('Contact Added Successfully');
            yield put(addContactSuccess(result.data.userData));
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}

export function* onAddContact() {
    yield takeLatest(AuthTypes.ADD_CONTACT, addContactAsync);
}


export function* deleteContactAsync({ payload }) {
    try {
        const result = yield clientHttp.post(`/user/delete_contact`, payload);
        if (result && result.data) {
            yield put(deleteContactSuccess(result.data.userData));
            toast.success("Contact deleted Successfully")
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}

export function* onDeleteContact() {
    yield takeLatest(AuthTypes.DELETE_CONTACT, deleteContactAsync);
}


export function* userActivityAsync({ payload }) {
    try {
        const result = yield clientHttp.post(`/user/user_activity`, { id: payload });
        if (result && result.data) {
            yield put(userActivitySuccess(result.data));
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}

export function* auth2FATMP({ payload }) {
    try {
        const result = yield clientHttp.post(`/user/auth2FATMP`, payload);
        if(result){
            const msg = payload.state ? 'Input 2FA CODE' : '2FA Authenticator app is disabled';
            toast.success(msg);
            if(result.data.user){
                yield put(getUserSuccess(result.data.user));
            }
            yield put(auth2FATMPSuccess(result.data.value));
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}

export function* auth2FAConfirm({ payload }) {
    try {
        const result = yield clientHttp.post(`/user/auth2FAConfirm`, payload);
        if(result && result.data){
            const msg = '2FA Authenticator app is enabled';
            toast.success(msg);
            yield put(auth2FAConfirmSuccess(result.data))
            yield put(auth2FATMPSuccess(''))
        }
    }
    catch (error) {
        yield put(throwError(error));
    }
}

export function* onUserActivity() {
    yield takeLatest(AuthTypes.USER_ACTIVITY, userActivityAsync);
}

export function* onAUTH_2FA_TMP() {
    yield takeLatest(AuthTypes.AUTH_2FA_TMP, auth2FATMP);
}
export function* onAUTH_2FA_CONFIRM() {
    yield takeLatest(AuthTypes.AUTH_2FA_CONFIRM, auth2FAConfirm);
}

export function* authSagas() {
    yield all([
        call(onSignupStart),
        call(onLoginStart),
        call(onResetPasswordStart),
        call(onUpdateProfileStart),
        call(onRequestEmailResetPasswordStart),
        call(onEnableTwoAuth),
        call(onChangeCurrency),
        call(onSendTwoAuthVerif),
        call(onDepositAndWithdraw),
        call(onAuthReset),
        call(onAddContact),
        call(onDeleteContact),
        call(onUserActivity),
        call(onAUTH_2FA_TMP),
        call(onAUTH_2FA_CONFIRM),
        call(onSendOtpAuthVerif),
    ]);
};