export const UPDATE_BLOCK_INFO = 'UPDATE_BLOCK_INFO'
export const CLEAR_BLOCK_INFO = 'CLEAR_BLOCK_INFO'

export function updateBlockInfo(blockInfo) {
  return {
    type: UPDATE_BLOCK_INFO,
    blockInfo
  }
}

export function clearBlockInfo() {
  return {
    type: CLEAR_BLOCK_INFO,
  }
}
