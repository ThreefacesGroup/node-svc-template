import {NestExpressApplication} from "@nestjs/platform-express";
import {AppModule} from "./modules/app.module";
import {NestFactory} from "@nestjs/core";
import {DocumentBuilder, OpenAPIObject, SwaggerModule} from "@nestjs/swagger";
import {Logger} from "@nestjs/common";

export class ServerApplication {
    private readonly port: number;
    private readonly host: string;


    public async run() : Promise<void> {
        const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

        this.buildAPIDocumentation(app);
        this.log();

        await app.listen(this.port, this.host);
    }


    private buildAPIDocumentation(app: NestExpressApplication) {
        const title: string = 'IPoster';
        const description: string = 'IPoster API documentation';
        const version: string = '1.0.0';

        const options: Omit<OpenAPIObject, 'paths'> = new DocumentBuilder()
            .setTitle(title)
            .setDescription(description)
            .setVersion(version)
            .build();

        const document: OpenAPIObject = SwaggerModule.createDocument(app, options);

        SwaggerModule.setup('documentation', app, document);
    }

    private log(): void {
        Logger.log(`Server started on host: ${this.host}; port: ${this.port};`, ServerApplication.name);
    }

    public static new(): ServerApplication {
        return new ServerApplication();
    }
}