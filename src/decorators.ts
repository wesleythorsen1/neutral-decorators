import 'reflect-metadata';

export type ReflectiveOptions = {
  identifier?: string | symbol;
}

export type ReflectiveClassOptions = ReflectiveOptions;
export type ReflectivePropertyOptions = ReflectiveOptions;
export type ReflectiveMethodOptions = ReflectiveOptions;
export type ReflectiveParameterOptions = ReflectiveOptions;

export const reflectiveClasses = new Set<Function>();

export function ReflectiveClass(
  identifierOrOptions?: string | symbol | ReflectiveClassOptions,
): ClassDecorator {
  return function (target: Function): void {
    reflectiveClasses.add(target);

    const options =
      typeof identifierOrOptions === 'string' || typeof identifierOrOptions === 'symbol'
        ? { identifier: identifierOrOptions }
        : identifierOrOptions || {};

    Reflect.defineMetadata('reflective:options', options || {}, target);
  };
}

export function ReflectiveProperty(
  identifierOrOptions?: string | symbol | ReflectivePropertyOptions,
): PropertyDecorator {
  return function (target: Object, propertyKey: string | symbol): void {
    const existingMetadata: Map<string | symbol, any> =
      Reflect.getOwnMetadata('reflective:propertyoptions', target) || new Map();

    const propertyOptions =
      typeof identifierOrOptions === 'string' || typeof identifierOrOptions === 'symbol'
        ? { identifier: identifierOrOptions }
        : identifierOrOptions || {};

    existingMetadata.set(propertyKey, propertyOptions);

    Reflect.defineMetadata('reflective:propertyoptions', existingMetadata, target);
  };
}

export function ReflectiveMethod(
  identifierOrOptions?: string | symbol | ReflectiveMethodOptions,
): MethodDecorator {
  return function <T>(
    target: Object,
    propertyKey: string | symbol,
    // @ts-ignore - TODO
    descriptor: TypedPropertyDescriptor<T>,
  ): void {
    const existingMetadata: Map<string | symbol, ReflectiveMethodOptions> =
      Reflect.getOwnMetadata('reflective:methodoptions', target) || new Map();

    const methodOptions =
      typeof identifierOrOptions === 'string' || typeof identifierOrOptions === 'symbol'
        ? { identifier: identifierOrOptions }
        : identifierOrOptions || {};

    existingMetadata.set(propertyKey, methodOptions);

    Reflect.defineMetadata('reflective:methodoptions', existingMetadata, target);
  };
}

export function ReflectiveParameter(
  identifierOrOptions?: string | symbol | ReflectiveParameterOptions,
): ParameterDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ): void {
    if (propertyKey !== undefined) return;

    const existingMetadata: any[] = Reflect.getOwnMetadata('reflective:paramoptions', target) || [];

    const paramOptions =
      typeof identifierOrOptions === 'string' || typeof identifierOrOptions === 'symbol'
        ? { identifier: identifierOrOptions }
        : identifierOrOptions || {};

    existingMetadata[parameterIndex] = paramOptions;

    Reflect.defineMetadata('reflective:paramoptions', existingMetadata, target);
  };
}
