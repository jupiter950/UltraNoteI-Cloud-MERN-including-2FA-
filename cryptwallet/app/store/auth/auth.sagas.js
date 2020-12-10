import { toast } from 'react-toastify';
import cookie from 'js-cookie';
import { takeLatest, call, put, all } from 'redux-saga/effects';
import { clientHttp } from '../../utils/services/httpClient';
import { loginFailure, signupFailure, signupSuccess, loginSuccess, enableTwoAuthSuccess, sendTwoCodeFailure, sendTwoCodeSuccess } from './auth.actions';

import AuthTypes from './auth.types';

export function* signupStartAsync({payload}) {
    try {
        const requestData = {
            firstName: payload.firstName,
            lastName: payload.lastName,
            mail: payload.email,
            phone: payload.phone,
            password: payload.password
        };
        const result = yield clientHttp.post('/signup', requestData);
        if (result && result.data) {
            payload.history.push('/login');
            toast.success('Account created successfully, We have sent an email with a confirmation link to your email address.');
            yield put(signupSuccess());
        }
    }
    catch(error) {
        yield put(signupFailure(error));
    }
}

export function* onSignupStart() {
    yield takeLatest(AuthTypes.SIGNUP_START, signupStartAsync);
}

export function* loginStartAsync({payload}) {
    try {
        const requestData = {
            mail: payload.email,
            password: payload.password
        };

        const result = yield clientHttp.post('/signin',requestData);
        if (result && result.data) {
            const {twoFA, token} = result.data;
            if (twoFA) {
                toast.info('4-digit verication code is sent to your email');
                payload.history.push(`/confirm-code/${token}`);
            }
            else {
                cookie.set('Auth', true);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('token', result.data.token);
            toast.success('Successfully login');
            payload.history.push('/dashboard');
            yield put(loginSuccess(result.data));
            }
        }
    }
    catch(error) {
        yield put(loginFailure(error));
    }
}

export function* onLoginStart() {
    yield takeLatest(AuthTypes.LOGIN_START, loginStartAsync);
}


export function* resetPasswordAsync({payload}) {
    const requestData = {
        password: payload.password
    };
    const token = payload.token;

    try {
        const result = yield clientHttp.post(`/newpassword/${token}`, requestData);
        if (result) {
            toast.success("Password successfuly updated");
            const {history} = payload;
            history.push('/login');
        }
    }
    catch(error) {
        yield put(resetPasswordFailure(error));
    }
}


export function* onResetPasswordStart() {
    yield takeLatest(AuthTypes.RESET_PASSWORD, resetPasswordAsync);
}

export function* requestEmailResetAsync({payload}) {
    console.log(payload);
    const requestData = {
        mail: payload.email
    };

    try {
        const result = yield clientHttp.post('/resetmail', requestData);
        if (result) {
            toast.info("You should soon receive an email allowing you to reset your password. Please make sure to check your spam and trash if you can't find the email.");
            const {history} = payload;
            history.push('/');
        }
    }
    catch(error) {
        yield put(requestEmailResetFailure(error));
    }
}


export function* onRequestEmailResetPasswordStart() {
    yield takeLatest(AuthTypes.REQUEST_EMAIL_RESET, requestEmailResetAsync);
}


export function* enableTwoAuthAsync({payload}) {
    console.log(payload);
    try {
        const result = yield clientHttp.post('/settings/change2fa', payload);
        if (result) {
            const msg = payload.isActive ? 'Authenticator app is enabled' : 'Authenticator app is disabled'; 
            toast.success(msg);
            yield put(enableTwoAuthSuccess(payload))
        }
    }
    catch(error) {
        yield put(enableTwoAuthFailure(error));
    }
}


export function* onEnableTwoAuth() {
    yield takeLatest(AuthTypes.ENABLE_TWO_AUTH, enableTwoAuthAsync);
}


export function* sendTwoAuthVerifAsync({payload}) {
    
    try {
        const requestData = {
            code: payload.code,
        }
        const result = yield clientHttp.post(`/twofacode/${payload.token}`, requestData);
        if (result && result.data) {
            const {user, token} = result.data;
            cookie.set('Auth', true);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            localStorage.setItem('token', result.data.token);
            toast.success('Successfully login');
            payload.history.push('/dashboard');
            yield put(sendTwoCodeSuccess({user, token}));
        }
    }
    catch(error) {
        yield put(sendTwoCodeFailure(error));
    }
}


export function* onSendTwoAuthVerif() {
    yield takeLatest(AuthTypes.SEND_CODE_TWO_AUTH, sendTwoAuthVerifAsync);
}


export function* authSagas() {
    yield all([
        call(onSignupStart),
        call(onLoginStart),
        call(onResetPasswordStart),
        call(onRequestEmailResetPasswordStart),
        call(onEnableTwoAuth),
        call(onSendTwoAuthVerif)
    ]);
};