
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_VERIFY_SECRET || '',
        });
    }

    async validate(payload: any) {
        const user = await this.usersService.findOne({where: {uuid: payload.uuid, tokenVersion: payload.version}});
        // console.log({user})
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
