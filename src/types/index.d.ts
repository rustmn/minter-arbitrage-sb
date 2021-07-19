export interface IPair {
  coin0: string
  coin1: string
  name: string
  type: 'stable' | 'crypto'
  pool: Pool
}

export interface IPool {
  coin0: ICoin
  coin1: ICoin
  token: ICoin
  amount0: string
  amount1: string
  liquidity: string
  liquidity_bip: string
  trade_volume_bip_1d: string
  trade_volume_bip_30d: string
}

export interface ICoin {
  id: number
  symbol: string
}

export interface IRoute {
  pools: IPool[]
}

export interface ITriplet {
  enter: IPool
  first_stage: IPool[]
  second_stage: [IPool[]]
}