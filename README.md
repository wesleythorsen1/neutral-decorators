Neutral Decorators
==================

A neutral decorator library for emitting TypeScript metadata. Designed to be framework-agnostic, this library facilitates the use of decorators to emit metadata without coupling your code to specific libraries or frameworks. It enables advanced features like dependency injection, method interception, and runtime type inspection while maintaining clean separation of concerns.

Table of Contents
-----------------

*   [Introduction](#introduction)
*   [Why Use Neutral Decorators](#why-use-neutral-decorators)
*   [Who Should Use This Library](#who-should-use-this-library)
*   [Installation](#installation)
*   [Usage](#usage)
    *   [Class Decorator: `@Reflective`](#class-decorator-reflective)
    *   [Parameter Decorator: `@ReflectiveParam`](#parameter-decorator-reflectiveparam)
    *   [Property Decorator: `@ReflectiveProperty`](#property-decorator-reflectiveproperty)
    *   [Method Decorator: `@ReflectiveMethod`](#method-decorator-reflectivemethod)
*   [Examples](#examples)
    *   [Dependency Injection Use Case](#dependency-injection-use-case)
    *   [Method Interception Use Case](#method-interception-use-case)
    *   [Runtime Type Inspection Use Case](#runtime-type-inspection-use-case)
*   [Advanced Topics](#advanced-topics)
    *   [Custom Metadata Retrieval](#custom-metadata-retrieval)
    *   [Integration with Other Frameworks](#integration-with-other-frameworks)
*   [Contributing](#contributing)
*   [License](#license)

Introduction
------------

Decorators in TypeScript are a powerful feature that allows you to add annotations and metadata to classes, methods, properties, and parameters. However, using decorators often ties your code to specific frameworks or libraries, which can hinder flexibility and reusability.

**Neutral Decorators** provides a set of minimal, no-operation decorators that trigger metadata emission in TypeScript without introducing any framework-specific logic. This allows you to:

*   Collect runtime type information and custom metadata.
*   Maintain decoupled and clean architecture.
*   Facilitate advanced patterns like dependency injection (DI) without hard dependencies.

Why Use Neutral Decorators
--------------------------

*   **Framework Agnostic**: Avoid coupling your code to specific libraries or frameworks.
*   **Metadata Emission**: Utilize TypeScript's `emitDecoratorMetadata` to access runtime type information.
*   **Separation of Concerns**: Keep your core codebase clean and focused on business logic.
*   **Flexibility**: Enable integration with various tools and frameworks without code changes.
*   **Extensibility**: Provide a foundation for advanced features like DI, AOP, and reflection.

Who Should Use This Library
---------------------------

*   **Library Authors**: Who want to provide metadata for consumers without enforcing specific dependencies.
*   **Developers Implementing DI Containers**: Who need to collect type and metadata information without coupling to a DI framework.
*   **Teams Emphasizing Clean Architecture**: Who prioritize separation of concerns and decoupled code.
*   **Projects Requiring Runtime Type Information**: For scenarios like serialization, validation, or logging that need type metadata at runtime.
*   **Anyone Using TypeScript Decorators**: Who wants to ensure metadata emission without side effects.

Installation
------------

Install the package using npm or yarn:

bash

Copy code

`npm install neutral-decorators`

or

bash

Copy code

`yarn add neutral-decorators`

Ensure that you have the following settings in your `tsconfig.json`:

json

Copy code

`{   "compilerOptions": {     "experimentalDecorators": true,     "emitDecoratorMetadata": true   } }`

Usage
-----

Import the decorators into your TypeScript files:

typescript

Copy code

`import {   Reflective,   ReflectiveParam,   ReflectiveProperty,   ReflectiveMethod } from 'neutral-decorators';`

### Class Decorator: `@Reflective`

Marks a class for metadata emission. Applying this decorator triggers TypeScript to emit design-time type information at runtime.

**Usage:**

typescript

Copy code

`@Reflective() class MyClass {   // Class implementation }`

**Parameters:**

*   `options?: ReflectiveOptions`: An optional object for future extensibility.

### Parameter Decorator: `@ReflectiveParam`

Annotates constructor parameters with custom metadata, such as identifiers or options. This is especially useful when you need to distinguish between multiple dependencies of the same type.

**Usage:**

typescript

Copy code

`class MyClass {   constructor(     @ReflectiveParam() param1: Type1,     @ReflectiveParam('customIdentifier') param2: Type2   ) {} }`

**Parameters:**

*   `identifierOrOptions?: string | symbol | ReflectiveParamOptions`: An optional identifier or options object.

### Property Decorator: `@ReflectiveProperty`

Annotates class properties with custom metadata, allowing for property injection or other runtime behaviors.

**Usage:**

typescript

Copy code

`class MyClass {   @ReflectiveProperty()   private readonly property1: Type1;    @ReflectiveProperty('customIdentifier')   private readonly property2: Type2; }`

**Parameters:**

*   `identifierOrOptions?: string | symbol | ReflectivePropertyOptions`: An optional identifier or options object.

### Method Decorator: `@ReflectiveMethod`

Annotates methods with custom metadata, which can be used for method interception, logging, or other cross-cutting concerns.

**Usage:**

typescript

Copy code

`class MyClass {   @ReflectiveMethod()   myMethod(): void {     // Method implementation   }    @ReflectiveMethod('customMethodIdentifier')   anotherMethod(): void {     // Method implementation   } }`

**Parameters:**

*   `identifierOrOptions?: string | symbol | ReflectiveMethodOptions`: An optional identifier or options object.

Examples
--------

### Dependency Injection Use Case

**Scenario:**

You are building an application that requires dependency injection, but you want to avoid coupling your classes to a specific DI framework.

**Implementation:**

typescript

Copy code

``import 'reflect-metadata'; import {   Reflective,   ReflectiveParam } from 'neutral-decorators';  @Reflective() class Logger {   log(message: string): void {     console.log(message);   } }  @Reflective() class UserService {   constructor(     @ReflectiveParam() private readonly logger: Logger   ) {}    getUser(id: string): User {     this.logger.log(`Fetching user with id: ${id}`);     // Fetch user logic   } }  // In your DI container setup function resolveDependencies<T>(target: new (...args: any[]) => T): T {   const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', target) || [];   const dependencies = paramTypes.map((paramType) => {     return resolveDependencies(paramType);   });   return new target(...dependencies); }  const userService = resolveDependencies(UserService); userService.getUser('123');``

**Explanation:**

*   `@Reflective()` is used to mark classes for metadata emission.
*   `@ReflectiveParam()` annotates constructor parameters.
*   The `resolveDependencies` function uses `reflect-metadata` to retrieve constructor parameter types and recursively resolves dependencies.

### Method Interception Use Case

**Scenario:**

You want to implement logging around certain methods without modifying their implementation or introducing framework-specific decorators.

**Implementation:**

typescript

Copy code

``import 'reflect-metadata'; import { Reflective, ReflectiveMethod } from 'neutral-decorators';  @Reflective() class DataService {   @ReflectiveMethod()   fetchData(): string {     return 'Data';   }    @ReflectiveMethod('logOnly')   processData(): void {     // Processing logic   } }  // Interceptor setup function applyMethodInterceptors(target: any): void {   const methodMetadata: Map<string | symbol, any> =     Reflect.getMetadata('reflective:methodoptions', target.prototype) || new Map();    for (const [methodName, options] of methodMetadata.entries()) {     const originalMethod = target.prototype[methodName];      target.prototype[methodName] = function (...args: any[]) {       console.log(`Entering method ${String(methodName)}`);       const result = originalMethod.apply(this, args);       console.log(`Exiting method ${String(methodName)}`);       return result;     };   } }  applyMethodInterceptors(DataService);  const dataService = new DataService(); dataService.fetchData(); dataService.processData();``

**Explanation:**

*   `@ReflectiveMethod()` marks methods for interception.
*   `applyMethodInterceptors` retrieves method metadata and wraps methods with logging logic.
*   This approach avoids modifying the original methods or introducing dependencies.

### Runtime Type Inspection Use Case

**Scenario:**

You need to perform runtime validation or serialization based on property types.

**Implementation:**

typescript

Copy code

`import 'reflect-metadata'; import { ReflectiveProperty } from 'neutral-decorators';  class User {   @ReflectiveProperty()   id: string;    @ReflectiveProperty()   name: string;    @ReflectiveProperty()   email: string; }  function serialize(instance: any): any {   const serializedData: any = {};   const prototype = Object.getPrototypeOf(instance);    for (const propertyName of Object.keys(instance)) {     const type = Reflect.getMetadata('design:type', prototype, propertyName);     serializedData[propertyName] = {       value: instance[propertyName],       type: type.name     };   }    return serializedData; }  const user = new User(); user.id = '123'; user.name = 'Alice'; user.email = 'alice@example.com';  console.log(serialize(user));`

**Explanation:**

*   `@ReflectiveProperty()` marks properties to emit metadata.
*   The `serialize` function uses `reflect-metadata` to retrieve property types and constructs a serialized representation.
*   This method can be extended for validation or other runtime type-dependent logic.

Advanced Topics
---------------

### Custom Metadata Retrieval

You can retrieve custom metadata stored by the decorators using `reflect-metadata`.

**Example:**

typescript

Copy code

`function getConstructorParamOptions(target: any): any[] {   return Reflect.getMetadata('reflective:paramoptions', target) || []; }  function getPropertyOptions(target: any, propertyKey: string | symbol): any {   return Reflect.getMetadata('reflective:propertyoptions', target, propertyKey); }  function getMethodOptions(target: any, methodName: string | symbol): any {   return Reflect.getMetadata('reflective:methodoptions', target, methodName); }`

### Integration with Other Frameworks

Since the decorators are neutral, they can be integrated with various frameworks without code changes.

**Example with a Hypothetical DI Framework:**

typescript

Copy code

`import 'reflect-metadata'; import { Reflective, ReflectiveParam } from 'neutral-decorators'; import { DIContainer } from 'my-di-framework';  @Reflective() class ConfigService {   // Implementation }  @Reflective() class AppService {   constructor(     @ReflectiveParam() private readonly configService: ConfigService   ) {} }  const container = new DIContainer(); container.register(ConfigService); container.register(AppService);  const appService = container.resolve(AppService);`

**Explanation:**

*   The DI framework can use `reflect-metadata` to retrieve constructor parameter types.
*   The neutral decorators enable metadata emission without coupling to the DI framework.

Contributing
------------

Contributions are welcome! Please open issues or submit pull requests on the [GitHub repository](https://github.com/yourusername/neutral-decorators).

When contributing:

*   Ensure code follows the project's coding standards.
*   Write tests for new features or bug fixes.
*   Update documentation as needed.

License
-------

This project is licensed under the MIT License.

* * *

**Note:** This library relies on TypeScript's experimental decorator features and the `reflect-metadata` library. Ensure that your project is configured appropriately to use these features.