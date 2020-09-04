<template>
  <div id="app-container">
    <!-- 查询表单 -->
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item>
        <el-input v-model="bookQuery.title" placeholder="书名" />
      </el-form-item>
      <el-form-item label="授权开始时间">
        <el-date-picker
          v-model="bookQuery.beginDate"
          type="datetime"
          placeholder="选择开始时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="00:00:00"
        />
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="bookQuery.endDate"
          type="datetime"
          placeholder="选择截止时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          default-time="00:00:00"
        />
      </el-form-item>
      <el-button type="primary" @click="getFindPageBook()">查询</el-button>
      <el-button type="primary" @click="resetData()">清空</el-button>
      <router-link :to="'/cms/book/save'">
        <el-button type="primary">添加书籍</el-button>
      </router-link>
    </el-form>
    <!-- 列表 el -->
    <el-table :data="bookList" border fit highlight-current-row>
      <el-table-column label="序号" width="70" align="center">
        <template slot-scope="scope">
          {{ (pageNo - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="id" label="书籍ID" width="80" />
      <el-table-column prop="title" label="书名"/>
      <el-table-column prop="author" label="作者" />
      <el-table-column prop="firstSort" label="一级分类" />
      <el-table-column prop="secondSort" label="二级分类" />
      <el-table-column label="连载">
        <template slot-scope="scope">
          {{ scope.row.serialize === 1 ? '连载中' : '完结' }}
        </template>
      </el-table-column>
      <el-table-column prop="wordNumber" label="字数" />
      <el-table-column label="状态">
        <template slot-scope="scope">
          {{ scope.row.status === 1 ? '上线' : '未上线'}}
        </template>
      </el-table-column>
      <el-table-column label="全本收费">
        <template slot-scope="scope">
          {{ scope.row.free === 1 ? '收费' : '免费' }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="授权开始时间" />
      <el-table-column prop="endTime" label="授权结束时间" />
      <el-table-column label="原创">
        <template slot-scope="scope">
          {{ scope.row.original === 1 ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="授权状态">
        <template slot-scope="scope">
          {{ currentTime > scope.row.endTime ? '过期' : '有效' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="danger" size="mini" @click="deleteBook(scope.row.id, scope.row.status)">删除</el-button>
          <router-link :to="'/cms/book/update/'+scope.row.id">
            <el-button type="primary" size="mini" >修改</el-button>
          </router-link>
          <el-button v-if="scope.row.status === 0" type="danger" size="mini" icon="el-icon-delete" @click="upOrDownBook(scope.row.id, 1)">上架书籍</el-button>
          <el-button v-else type="danger" size="mini" @click="upOrDownBook(scope.row.id, 0)">下架书籍</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      :page-size="pageSize"
      :current-page="pageNo"
      :total="total"
      :pager-count="11"
      style="padding: 30px 0; text-align: center;"
      layout="total, prev, pager, next, jumper"
      @current-change="getFindPageBook">
    </el-pagination>
  </div>
</template>

<script>
import book from '@/api/cms/book'

export default {
  data() { // ## 定义变量和初始值
    return {
      bookList: [], // ## 数据列表
      bookQuery: {}, // ##查询条件封装对象
      total: 0, // ## 总记录数
      pageNo: 1, // ## 页码
      pageSize: 5, // ## 每页显示记录数
      currentTime: '' // ## 当前时间
    }
  },
  created() { // ## 在页面渲染之前,一般先调用methods定义的方法
    this.getFindPageBook()
  },
  methods: { // ## 创建具体的方法,调用 book.js 定义的方法
    getFindPageBook(pageNo = 1) { // ## 带分页的条件查询
      this.pageNo = pageNo
      book.findPageBook(this.pageNo, this.pageSize, this.bookQuery)
        .then(response => {
          this.bookList = response.data.items
          this.total = response.data.total
          this.currentTime = this.format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        })
    },
    resetData() { // ## 清空查询数据
      // ## 把对象置空
      this.bookQuery = {}
      // ## 重新查询
      this.getFindPageBook()
    },
    deleteBook(bookId, status) { // ## 删除
      // ## status : 上线1 未上线0 上线不能删除,未上线可以删除
      if (status === 0) {
        this.$confirm('此操作将永久删除该书籍记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          book.deleteByBookId(bookId)
            .then(response => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              // ## 重新查询数据
              this.getFindPageBook()
            })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        this.$message({
          type: 'info',
          message: '此书籍为上线状态,不能进行删除操作!'
        })
      }
    },
    upOrDownBook(bookId, status) { // ## 上线或未上线的状态操控
      this.$confirm('此操作将针对此书籍的状态进行变更, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        book.upOrDownBook(bookId, status)
          .then(response => {
            this.$message({
              type: 'success',
              message: '操作成功!'
            })
            // ## 重新查询
            this.getFindPageBook()
          })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消操作'
        })
      })
    },
    format(date, fmt) { // ## 格式化日期
      let o = {
        'M+': date.getMonth() + 1, // ## 月份
        'd+': date.getDate(), // ## 日
        'H+': date.getHours(), // ## 小时
        'm+': date.getMinutes(), // ## 分
        's+': date.getSeconds(), // ## 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // ## 季度
        'S': date.getMilliseconds() // ## 毫秒
      }
      if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
      for (let k in o)
        if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      return fmt
    }
  }
}
</script>
