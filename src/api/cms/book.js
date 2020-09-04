import request from '@/utils/request'

const api_name = '/cms/book'

export default {
  // ## 定义要调用的API
  findPageBook(pageNo, pageSize, bookQuery) { // ## 带分页的条件查询
    return request({
      url: `${api_name}/${pageNo}/${pageSize}`,
      method: 'post',
      data: bookQuery
    })
  },
  saveBook(book) { // ## 添加数据
    return request({
      url: `${api_name}/saveBook`,
      method: 'post',
      data: book
    })
  },
  getBookById(bookId) { // ## 回显
    return request({
      url: `${api_name}/${bookId}`,
      method: 'get'
    })
  },
  updateBook(book) { // ## 修改
    return request({
      url: `${api_name}/updateBook`,
      method: 'put',
      data: book
    })
  },
  deleteByBookId(bookId) { // ## 删除
    return request({
      url: `${api_name}/${bookId}`,
      method: 'delete'
    })
  },
  upOrDownBook(bookId, status) { // ## 根据ID操作书籍的上线下线状态
    return request({
      url: `${api_name}/${bookId}/${status}`,
      method: 'put'
    })
  }
}
