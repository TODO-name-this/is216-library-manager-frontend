// import { create } from "zustand"

// type State = {
//     restaurants: Restaurant[]
//     totalCount: number
//     pageCount: number
// }

// type Actions = {
//     setData: (data: PagedResult<Restaurant>) => void
// }

// const initialState: State = {
//     restaurants: [],
//     totalCount: 0,
//     pageCount: 0,
// }

// export const useRestaurantStore = create<State & Actions>((set) => ({
//     ...initialState,
//     setData: (data: PagedResult<Restaurant>) => {
//         set(() => ({
//             restaurants: data.results,
//             totalCount: data.totalCount,
//             pageCount: data.pageCount,
//         }))
//     }
// }))