import { User } from '../../domain/entities/User';
import { LoginUserResponse } from '../../dto/loginUserResponse';
import { SafeUser } from '../../dto/safeUser';
import { SignupUserResponse } from '../../dto/signupUserResponse';

type Token = {
    accessToken: string,
    refreshToken: string
}

export function toLoginUserResponse(user: SafeUser, token: Token): LoginUserResponse {

    return new LoginUserResponse(

        {
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            isAdmin: user.isAdmin,
            profilePicUrl: user.profilePicUrl,
            accessToken: token.accessToken,
            refreshToken: token.refreshToken
        }
    );
}


export function toSignupUserResponse(user: User, token: Token): SignupUserResponse {

    return new SignupUserResponse(
        {
            fullName: user.fullName,
            userName: user.userName,
            email: user.email,
            isAdmin: user.role == "admin",
            // profilePicUrl: user.profilePicUrl,
            accessToken: token.accessToken,
            refreshToken: token.refreshToken
        }
    );
}
