import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UserRepository } from "./auth.repository";
import { JwtService } from "@nestjs/jwt";
import { getConnectionToken } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { AppResponse } from "src/common/util/app.response";
import { AuthSignupDto } from "./dto/auth.dto";
import { User } from "./schema/auth.schema";
import { normalizeEmail } from "src/common/util/methods.util";
import { genSaltSync, hashSync, compareSync } from "bcrypt";

jest.mock("bcrypt");

type UserDocument = User & Document;

describe("AuthService", () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;
    let jwtService: jest.Mocked<JwtService>;
    let connection: jest.Mocked<Connection>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserRepository,
                    useValue: {
                        findByEmail: jest.fn(),
                        create: jest.fn(),
                        findById: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                    },
                },
                {
                    provide: getConnectionToken(),
                    useValue: {
                        startSession: jest.fn().mockReturnValue({
                            startTransaction: jest.fn(),
                            commitTransaction: jest.fn(),
                            abortTransaction: jest.fn(),
                            endSession: jest.fn(),
                        }),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepository = module.get(UserRepository);
        jwtService = module.get(JwtService);
        connection = module.get(getConnectionToken());

        // Mock bcrypt functions
        (genSaltSync as jest.Mock).mockReturnValue("mockSalt");
        (hashSync as jest.Mock).mockImplementation((pass) => `hashed_${pass}`);
        (compareSync as jest.Mock).mockImplementation((pass, hash) => hash === `hashed_${pass}`);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /** ✅ CREATE USER TESTS **/
    describe("createUser", () => {
        it("should create a user successfully", async () => {
            const createUserDto: AuthSignupDto = {
                email: "hameed@example.com",
                password: "password123",
            };

            userRepository.findByEmail.mockResolvedValue(null);
            userRepository.create.mockResolvedValue({
                _id: "mockUserId",
                email: createUserDto.email,
                password: "hashed_password123", // Adjust to match hashing logic
            } as UserDocument);

            const result = await authService.createUser(createUserDto);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(normalizeEmail(createUserDto.email));
            expect(userRepository.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: "hashed_password123",
            });
            expect(result).toHaveProperty("email", normalizeEmail(createUserDto.email));
        });

        it("should return error if user already exists", async () => {
            userRepository.findByEmail.mockResolvedValue({
                _id: "mockUserId",
                email: "hameed@example.com",
                password: "mockPassword",
            } as User);

            const createUserDto: AuthSignupDto = { email: "hameed@example.com", password: "password123" };

            await expect(authService.createUser(createUserDto)).rejects.toThrow("User exists");

            expect(userRepository.findByEmail).toHaveBeenCalledWith(normalizeEmail(createUserDto.email));
        });
    });

    /** ✅ LOGIN TESTS **/
    describe("login", () => {
        it("should return a token when credentials are correct", async () => {
            const loginDto: AuthSignupDto = { email: "hameed@example.com", password: "password123" };
            const user: User = { _id: "userId123", email: loginDto.email, password: "hashed_password123" } as User;

            userRepository.findByEmail.mockResolvedValue(user);
            jwtService.signAsync.mockResolvedValue("mockJwtToken");

            const result = await authService.login(loginDto);

            expect(userRepository.findByEmail).toHaveBeenCalledWith(normalizeEmail(loginDto.email));
            expect(result).toBe("mockJwtToken");
        });

        it("should throw an error if user does not exist", async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            const loginDto: AuthSignupDto = { email: "hameed@example.com", password: "password123" };

            await expect(authService.login(loginDto)).rejects.toThrow("User doesn't exist");

            expect(userRepository.findByEmail).toHaveBeenCalledWith(normalizeEmail(loginDto.email));
        });

        it("should throw an error if password is incorrect", async () => {
            const loginDto: AuthSignupDto = { email: "hameed@example.com", password: "wrongPassword" };
            const user: User = { _id: "userId123", email: loginDto.email, password: "hashed_correctPassword" } as User;

            userRepository.findByEmail.mockResolvedValue(user);
            (compareSync as jest.Mock).mockReturnValue(false);

            await expect(authService.login(loginDto)).rejects.toThrow("Invalid Password supplied!");

            expect(userRepository.findByEmail).toHaveBeenCalledWith(normalizeEmail(loginDto.email));
        });
    });

    /** ✅ PROFILE TESTS **/
    describe("profile", () => {
        it("should return user profile if user exists", async () => {
            const user: User = { _id: "userId123", email: "hameed@example.com" } as User;

            userRepository.findById.mockResolvedValue(user as UserDocument);

            const result = await authService.profile("userId123");

            expect(userRepository.findById).toHaveBeenCalledWith("userId123");
            expect(result).toEqual(user);
        });

        it("should throw an error if user is not found", async () => {
            userRepository.findById.mockResolvedValue(null);

            await expect(authService.profile("userId123")).rejects.toThrow("User doesn't exist");

            expect(userRepository.findById).toHaveBeenCalledWith("userId123");
        });
    });
});