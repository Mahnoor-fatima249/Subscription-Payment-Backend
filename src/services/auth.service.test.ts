import { AuthService } from '../services/auth.service';
import prisma from '../utils/prisma';

describe('AuthService', () => {
  const testUser = {
    email: 'test@auth.com',
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User',
  };

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
  });

  it('should register a new user', async () => {
    const result = await AuthService.register(testUser);

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe(testUser.email);
    expect(result.user.firstName).toBe(testUser.firstName);
    expect(result.user.lastName).toBe(testUser.lastName);
    expect(result.user.role).toBe('CUSTOMER');
  });

  it('should not register duplicate email', async () => {
    await expect(AuthService.register(testUser)).rejects.toThrow('Email already registered');
  });

  it('should login with valid credentials', async () => {
    const result = await AuthService.login(testUser.email, testUser.password);

    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe(testUser.email);
  });

  it('should not login with invalid password', async () => {
    await expect(AuthService.login(testUser.email, 'wrongpassword')).rejects.toThrow('Invalid credentials');
  });

  it('should not login with invalid email', async () => {
    await expect(AuthService.login('nonexistent@test.com', testUser.password)).rejects.toThrow('Invalid credentials');
  });

  it('should refresh token', async () => {
    const loginResult = await AuthService.login(testUser.email, testUser.password);
    const tokens = await AuthService.refreshToken(loginResult.refreshToken);

    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
  });
});