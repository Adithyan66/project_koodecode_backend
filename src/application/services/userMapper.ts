import { User } from '../../domain/entities/User';
import { LoginUserResponse } from '../dto/users/loginUserResponse';
import { SafeUser } from '../dto/users/safeUser';
import { SignupUserResponse } from '../dto/users/signupUserResponse';

type Token = {
    accessToken: string,
    refreshToken: string
}

export function toLoginUserResponse(user: SafeUser, token: Token): LoginUserResponse {

    return new LoginUserResponse(

        {
            id: user.id.toString(),
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
