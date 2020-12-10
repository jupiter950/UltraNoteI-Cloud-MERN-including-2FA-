import AuthTypes from './auth.types';


const INITIAL_STATE = {
    isRegistred: false,
    isLoggedIn: false,
    isLoading: false,
    user: null,
    token: '',
    error: null
};


const authReducer = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case AuthTypes.SIGNUP_START: 
            return {
                ...state,
                isLoading: true
            };
        case AuthTypes.SIGNUP_SUCCESS: 
            return {
                ...state,
                isRegistred: true,
                isLoading: false
            };
            case AuthTypes.LOGIN_START: 
            return {
                ...state,
                isLoading: true
            };
        case AuthTypes.LOGIN_SUCESS: 
            return {
                ...state,
                isRegistred: true,
                isLoading: false,
                isLoggedIn: true,
                user: action.payload.user,
                token: action.payload.token
            };
        case AuthTypes.AUTO_LOGIN: 
            return {
                ...state,
                isRegistred: true,
                isLoading: false,
                isLoggedIn: true,
                user: action.payload.user,
                token: action.payload.token
            };

        case AuthTypes.ENABLE_TWO_AUTH_SUCCESS:
            const userUpdated = state.user;
            userUpdated.two_fact_auth = action.payload.isActive;
            localStorage.setItem('user', JSON.parse(userUpdated));
            return {
                ...state,
                user: userUpdated
            } ;

        case AuthTypes.SEND_CODE_TWO_AUTH_SUCCESS: 
            return {
                ...state,
                isRegistred: true,
                isLoading: false,
                isLoggedIn: true,
                user: action.payload.user,
                token: action.payload.token

            };
        
        case AuthTypes.ERROR:
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
}

export default authReducer;