import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RpcException } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import * as bcryptjs from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService

    ) { }

    private readonly logger = new Logger(AuthService.name);


    onModuleInit() {
        this.logger.log('AuthService initialized');
        this.prisma.$connect();
    }


    async registerUser(registerUserDto: RegisterUserDto) {
        const { email, name, password } = registerUserDto;
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: email
                },
            });

            if (user) {
                throw new RpcException({
                    status: 400,
                    message: 'User already exists'
                })
            }

            const newUser = await this.prisma.user.create({
                data: {
                    email: email,
                    name: name,
                    password: bcryptjs.hashSync(password, 10) // TODO: Encriptar la contraseña
                }
            });

            const { password: __, ...userWithoutPassword } = newUser;

            return {
                user: userWithoutPassword,
                token: 'token' // TODO: Generar el token
            }





        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            })
        }
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: email
                }
            });

            if (!user) {
                throw new RpcException({
                    status: 400,
                    message: 'Invalid credentials'
                })
            }

            const isPasswordValid = bcryptjs.compareSync(password, user.password);

            if (!isPasswordValid) {
                throw new RpcException({
                    status: 400,
                    message: 'Invalid password'
                })
            }

            const { password: __, ...userWithoutPassword } = user;

            return {
                user: userWithoutPassword,
                token: 'token' // TODO: Generar el token
            }

        } catch (error) {
            throw new RpcException({
                status: 400,
                message: error.message
            })
        }

    }

}
