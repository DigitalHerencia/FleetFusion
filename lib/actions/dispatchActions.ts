/** @format */

// In-memory store for dispatches
const dispatches: any[] = []

// Basic CRUD action implementations

export function createDispatch(data: any) {
    const newDispatch = { id: Date.now().toString(), ...data }
    dispatches.push(newDispatch)
    return { type: "CREATE_DISPATCH", payload: newDispatch }
}

export function readDispatch(id: string) {
    const dispatch = dispatches.find(d => d.id === id)
    return { type: "READ_DISPATCH", payload: dispatch }
}

export function updateDispatch(id: string, data: any) {
    const index = dispatches.findIndex(d => d.id === id)
    if (index !== -1) {
        dispatches[index] = { ...dispatches[index], ...data }
        return { type: "UPDATE_DISPATCH", payload: dispatches[index] }
    }
    return { type: "UPDATE_DISPATCH", payload: null }
}

export function deleteDispatch(id: string) {
    const index = dispatches.findIndex(d => d.id === id)
    let deleted = null
    if (index !== -1) {
        deleted = dispatches.splice(index, 1)[0]
    }
    return { type: "DELETE_DISPATCH", payload: deleted }
}
