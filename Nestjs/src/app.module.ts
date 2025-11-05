import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/hype-macro',
      {
        autoCreate: true,
        autoIndex: true,
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully to database: hype-macro');
          });
          connection.on('disconnected', () => {
            console.log('❌ MongoDB disconnected');
          });
          connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
          });
          
          // Log all database operations
          connection.plugin((schema) => {
            // Get collection name from schema
            const getCollectionName = (doc: any) => {
              return doc?.collection?.collectionName || doc?.constructor?.collection?.collectionName || 'unknown';
            };
            
            schema.post('save', function(doc) {
              const modelName = doc.constructor.modelName;
              const collectionName = getCollectionName(doc);
              if (modelName === 'User') {
                console.log(`✅ CREATE [${collectionName}]: ${doc.name} (${doc.email})`);
              } else {
                console.log(`✅ CREATE [${collectionName}]: ${modelName} - ID: ${doc._id}`);
              }
            });
            
            schema.post('findOneAndUpdate', function(doc) {
              if (doc) {
                const modelName = doc.constructor.modelName;
                const collectionName = getCollectionName(doc);
                if (modelName === 'User') {
                  console.log(`✅ UPDATE [${collectionName}]: ${doc.name} (${doc.email})`);
                } else {
                  console.log(`✅ UPDATE [${collectionName}]: ${modelName} - ID: ${doc._id}`);
                }
              }
            });
            
            schema.post('findOneAndDelete', function(doc) {
              if (doc) {
                const modelName = doc.constructor.modelName;
                const collectionName = getCollectionName(doc);
                if (modelName === 'User') {
                  console.log(`✅ DELETE [${collectionName}]: ${doc.name} (${doc.email})`);
                } else {
                  console.log(`✅ DELETE [${collectionName}]: ${modelName} - ID: ${doc._id}`);
                }
              }
            });
            
            schema.post('deleteOne', function(result) {
              const collectionName = this.mongooseCollection?.collectionName || 'unknown';
              console.log(`✅ DELETE [${collectionName}]: Document removed`);
            });
            
            schema.post('find', function(docs) {
              const modelName = this.model?.modelName || 'Unknown';
              const collectionName = this.mongooseCollection?.collectionName || 'unknown';
              console.log(`✅ READ [${collectionName}]: Found ${docs.length} ${modelName}(s)`);
            });
            
            schema.post('findOne', function(doc) {
              if (doc) {
                const modelName = doc.constructor.modelName;
                const collectionName = getCollectionName(doc);
                if (modelName === 'User') {
                  console.log(`✅ READ [${collectionName}]: ${doc.name} (${doc.email})`);
                } else {
                  console.log(`✅ READ [${collectionName}]: ${modelName} - ID: ${doc._id}`);
                }
              }
            });
          });
          
          return connection;
        },
      },
    ),
    DatabaseModule,
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
