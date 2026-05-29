import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents/documents.service';
import { Document, DocumentShare } from './documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, DocumentShare])],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
