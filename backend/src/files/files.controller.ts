import {
    BadRequestException,
    Controller,
    Get, Header,
    Logger,
    NotFoundException,
    Param,
    Res,
    SetMetadata,
} from "@nestjs/common";
import { FilesService } from "./files.service";

@Controller("files")

export class FilesController
{
    private logger: Logger = new Logger("FilesController");
    constructor(
        private filesService: FilesService,
    ) { }

    @SetMetadata ("isPublic", true)
    @Header("Content-Type", "image")
    @Get(":filename")
    async getFile(@Param("filename") filename: string): Promise<void> {
        try
        {
            const file = this.filesService.getFile(filename);
            if (file == null) {
                throw new NotFoundException("File with name " + filename + " does not exist");
            }
                return file;
        }
        catch (err) {
            this.logger.error(err.stack);
            throw new BadRequestException(err.message);
        }
    }
}