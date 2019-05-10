<template>
  <d2-container>
    <!-- header 查询条件 -->
    <template slot="header">
      <el-button size="mini" type="default" @click="getList" icon="el-icon-refresh">刷新</el-button>
      <div style="float: right">
        <el-button size="mini" type="success" @click="handleApply" icon="el-icon-upload">同 步</el-button>
        <el-button size="mini" type="primary" @click="handleAdd" icon="el-icon-plus">新 增</el-button>
      </div>
    </template>
    <!-- table表格 -->
    <el-table :key='tableKey'
              :data="tableData"
              v-loading="tableLoading"
              element-loading-text="拼命加载中..."
              highlight-current-row
              stripe
              style="width: 100%">
      <el-table-column align="left" prop="serviceId" label="服务名称" />
      <el-table-column align="left" prop="path" label="匹配路劲" />
      <el-table-column align="center" label="去掉前缀" width="80">
        <template slot-scope="scope">
          <el-tag>{{scope.row.stripPrefix | enableFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否重试" width="80">
        <template slot-scope="scope">
          <el-tag>{{scope.row.retryable | enableFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否启用" width="80">
        <template slot-scope="scope">
          <el-tag>{{scope.row.enabled | enableFilter}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="url" label="转发地址" />
      <el-table-column align="center" prop="sensitiveheadersList" label="敏感头" />
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handleEdit(scope.row,scope.index)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="rowDel(scope.row,scope.index)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- footer 分页条 -->
    <template slot="footer">
        <el-pagination
          background
          @size-change="sizeChange"
          @current-change="currentChange"
          :current-page.sync="page.currentPage"
          :page-sizes="[10,20,30,50]"
          :page-size="page.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
          style="margin: -10px;">
        </el-pagination>
    </template>
    <!-- 表单弹窗 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="400px" :before-close="dialogClose">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="服务名称" prop="serviceId">
          <el-input v-model="form.serviceId" placeholder="请输入服务名称" clearable></el-input>
        </el-form-item>
        <el-form-item label="匹配路劲" prop="path">
          <el-input v-model="form.path" placeholder="请输入匹配路劲" clearable></el-input>
        </el-form-item>
        <el-form-item label="转发地址" prop="url">
          <el-input v-model="form.url" placeholder="请输入转发地址" clearable></el-input>
        </el-form-item>
        <el-form-item label="敏感头" prop="sensitiveheadersList">
          <el-input v-model="form.sensitiveheadersList" placeholder="请输入敏感头" clearable></el-input>
        </el-form-item>
        <el-form-item label="去掉前缀" prop="stripPrefix">
          <el-radio-group v-model="form.stripPrefix" size="small">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否重试" prop="retryable">
          <el-radio-group v-model="form.retryable" size="small">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-radio-group v-model="form.enabled" size="small">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="small" @click="dialogFormVisible = false" icon="el-icon-close">取 消</el-button>
        <el-button size="small" v-if="dialogStatus=='create'" type="primary" @click="handleSave" icon="el-icon-check">保 存</el-button>
        <el-button size="small" v-else type="primary" @click="handleUpdate" icon="el-icon-check">修 改</el-button>
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
import {
  fetchList,
  addObj,
  getObj,
  putObj,
  delObj,
  applyObj
} from '@/api/route'
export default {
  name: 'route',
  data () {
    return {
      tableData: [],
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 10 // 每页显示多少条
      },
      tableLoading: false,
      tableKey: 0,
      dialogStatus: '',
      dialogFormVisible: false,
      textMap: {
        update: '编辑路由',
        create: '新增路由'
      },
      form: {
        stripPrefix: '1',
        retryable: '1',
        enabled: '1'
      },
      rules: {
        serviceId: [
          {
            required: true,
            message: '请输入服务名称',
            trigger: 'blur'
          }
        ],
        path: [
          {
            required: true,
            message: '请输入匹配路劲',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  filters: {
    enableFilter (enable) {
      const statusMap = {
        0: '否',
        1: '是'
      }
      return statusMap[enable]
    }
  },
  created () {
    this.getList()
  },
  mounted: function () {},
  methods: {
    getList () {
      this.tableLoading = true
      fetchList({
        page: this.page.currentPage,
        limit: this.page.pageSize
      }).then(response => {
        this.tableData = response.data.records
        this.page.total = response.data.total
        this.tableLoading = false
      })
    },
    currentChange (val) {
      this.page.currentPage = val
      this.getList()
    },
    sizeChange (val) {
      this.page.pageSize = val
      this.getList()
    },
    handleAdd: function () {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleApply: function () {
      var _this = this
      this.$confirm('是否确认同步至网关路由', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          return applyObj()
        })
        .then(data => {
          _this.$message({
            showClose: true,
            message: '同步成功',
            type: 'success'
          })
        })
    },
    handleEdit (row, index) {
      getObj(row.id)
        .then((res) => {
          this.form = res.data
          this.dialogFormVisible = true
          this.dialogStatus = 'update'
        })
    },
    /**
     * 删除路由
     */
    rowDel: function (row, index) {
      var _this = this
      this.$confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function () {
          delObj(row.id).then(data => {
            _this.tableData.splice(index, 1)
            _this.$message({
              showClose: true,
              message: '删除成功',
              type: 'success'
            })
            _this.getList()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    /**
     * 数据更新
     **/
    handleUpdate: function () {
      this.$refs.form.validate(valid => {
        if (valid) {
          putObj(this.form).then(data => {
            this.$message({
              showClose: true,
              message: '修改成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.getList()
          })
        }
      })
    },
    /**
     * 数据添加
     **/
    handleSave: function () {
      this.$refs.form.validate(valid => {
        if (valid) {
          addObj(this.form).then(data => {
            this.$message({
              showClose: true,
              message: '添加成功',
              type: 'success'
            })
            this.dialogFormVisible = false
            this.$refs.form.resetFields()
            this.getList()
          })
        }
      })
    },
    dialogClose (done) {
      this.$refs.form.resetFields()
      this.scope = []
      this.authorizedGrantTypes = []
      done()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
