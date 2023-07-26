import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, UnauthorizedException } from '@nestjs/common'
import { WsBadRequestException, WsUnauthaurizedException, WsUnknownException } from './ws-excepions'

@Catch()
export class WsCatchAllFilter implements ExceptionFilter
{
	catch(exception: Error, host: ArgumentsHost) {
		const socket = host.switchToWs().getClient()
		
		if (exception instanceof BadRequestException)
		{
			let exceptionData = exception.getResponse()
			let exceptionMessage = exceptionData['message'] ?? exceptionData ?? exception.name
			const wsException = new WsBadRequestException(exceptionMessage)
			socket.emit('error', wsException.getError())
			return
		}

		if (exception instanceof UnauthorizedException)
		{
			let exceptionData = exception.getResponse()
			let exceptionMessage = exceptionData['message'] ?? exceptionData ?? exception.name
			const wsException = new WsUnauthaurizedException(exceptionMessage)
			socket.emit('error', wsException.getError())
			return
		}
		
		const wsException = new WsUnknownException(exception.message)
		socket.emit('error', wsException.getError())
	}
}