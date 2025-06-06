import { instanceToPlain } from 'class-transformer';
import { Guard } from '../guard';
import {
  ArgumentInvalidException,
  ArgumentNotProvidedException,
  ArgumentOutOfRangeException,
} from '../exceptions/exceptions';

export type AggregateID = string;

export interface BaseEntityProps {
  id: AggregateID;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntityProps<T> {
  id: AggregateID;
  props: T;
  createdAt?: Date;
  updatedAt?: Date;
}

export abstract class Entity<EntityProps> {
  constructor({
    id,
    createdAt,
    updatedAt,
    props,
  }: CreateEntityProps<EntityProps>) {
    this.setId(id);
    this.validateProps(props);
    const now = new Date();
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
    this.props = props;
    this.validate();
  }
  protected readonly props: EntityProps;

  /**
   * A unique identifier representing the aggregate entity within the system.
   * This value is used to distinguish between different aggregate instances
   * and maintain consistency within operations related to a specific aggregate.
   *
   * @type {AggregateID}
   */
  protected _id: AggregateID;

  private readonly _createdAt: Date;
  private _updatedAt: Date;

  get id(): AggregateID {
    return this._id;
  }
  private setId(id: AggregateID) {
    this._id = id;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }
  static isEntity(entity: unknown): entity is Entity<unknown> {
    return entity instanceof Entity;
  }

  /**
   *  Checks if two entities are the same Entity by comparing ID field.
   * @param object Entity
   */
  public equals(object?: Entity<EntityProps>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!Entity.isEntity(object)) {
      return false;
    }

    return this.id ? this.id === object.id : false;
  }
  /**
   * Returns entity properties.
   * @return {*}  {Props & EntityProps}
   * @memberof Entity
   */
  public getProps(): EntityProps & BaseEntityProps {
    const propsCopy = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...this.props,
    };
    return Object.freeze(propsCopy);
  }
  public toObject(): unknown {
    const plainProps = instanceToPlain(this.props);
    const result = {
      id: this._id,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      ...plainProps,
    };
    return Object.freeze(result);
  }
  public abstract validate(): void;
  private validateProps(props: EntityProps): void {
    const MAX_PROPS = 50;

    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException(
        'Entity props should not be empty',
      );
    }
    if (typeof props !== 'object') {
      throw new ArgumentInvalidException('Entity props should be an object');
    }
    if (Object.keys(props as any).length > MAX_PROPS) {
      throw new ArgumentOutOfRangeException(
        `Entity props should not have more than ${MAX_PROPS} properties`,
      );
    }
  }
}
