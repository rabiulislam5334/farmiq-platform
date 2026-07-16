import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

// Socket handshake থেকে JWT verify করে user payload রিটার্ন করে,
// invalid হলে null রিটার্ন করে
export function authenticateSocket(
  socket: Socket,
  jwtService: JwtService,
): JwtPayload | null {
  try {
    const token =
      (socket.handshake.auth?.token as string) ||
      socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) return null;

    return jwtService.verify<JwtPayload>(token, {
      secret: process.env.JWT_SECRET as string,
    });
  } catch {
    return null;
  }
}
