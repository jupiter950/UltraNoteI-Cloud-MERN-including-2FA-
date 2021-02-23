import AuthTypes from './auth.types';


const INITIAL_STATE = {
    isRegistred: false,
    isLoggedIn: false,
    isLoading: false,
    user: null,
    userActivity: [],
    token: '',
    withdrawByMonth: [],
    depositByMonth: [],
    withdrawByDay: [],
    depositByDay: [],
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
            console.log("loginReducer", action.payload.user) 
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            return {
                ...state,
                isRegistred: true,
                isLoading: false,
                isLoggedIn: true,
                user: action.payload.user,
                token: action.payload.token
            };
        case AuthTypes.AUTO_LOGIN: 
            console.log(action.payload)
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

        case AuthTypes.DEPOSIT_AND_WITHDRAW_SUCCESS:
            return{
                ...state,
                withdrawByMonth: action.payload[0],
                depositByMonth: action.payload[1],
                withdrawByDay: action.payload[2],
                depositByDay: action.payload[3] 
            };

        case AuthTypes.UPDATE_PROFILE_SUCCESS:
            console.log("UPDATE_PROFILE_SUCCESS payload", action.payload);
            localStorage.setItem('user', JSON.stringify(action.payload));
            return{
                ...state,
                user: action.payload
            };

        case AuthTypes.GET_USER_SUCCESS:
            console.log("GET USER SUCCESS payload", action.payload);
            localStorage.setItem('user', JSON.stringify(action.payload));
            return{
                ...state,
                user: action.payload
            };

        case AuthTypes.ADD_CONTACT_SUCCESS:
            console.log("ADD_CONTACT_SUCCESS payload", action.payload);
            localStorage.setItem('user', JSON.stringify(action.payload));
            return{
                ...state,
                user: action.payload
            };


        case AuthTypes.DELETE_CONTACT_SUCCESS:
            console.log("DELETE_CONTACT_SUCCESS payload", action.payload);
            localStorage.setItem('user', JSON.stringify(action.payload));
            return{
                ...state,
                user: action.payload
            };

        case AuthTypes.USER_ACTIVITY_SUCCESS:
            console.log("USER_ACTIVITY_SUCCESS payload", action.payload);
            return{
                ...state,
                userActivity: action.payload
            };

        case AuthTypes.AUTH_RESET_SUCCESS:
            return { ...INITIAL_STATE};

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