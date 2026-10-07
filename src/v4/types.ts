import type { V4Command } from '../../game/v4/model';
type WithoutIdentity<T> = T extends {
    id: string;
} ? Omit<T, 'id'> : never;
export type PlayerAction = WithoutIdentity<V4Command>;
export type Dispatch = (action: PlayerAction) => Promise<boolean>;
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
