<template>
  <d2-container>
    <!-- header 查询条件 -->
    <template slot="header">
      <el-button size="mini" type="default" @click="getList" icon="el-icon-refresh">刷新</el-button>
      <div style="float: right">
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
      <el-table-column align="left" prop="clientId" label="客户端ID" />
      <el-table-column align="center" prop="clientSecret" label="客户端密钥" />
      <el-table-column align="center" prop="scope" label="授权范围" />
      <el-table-column align="center" prop="authorizedGrantTypes" label="授权模式" />
      <el-table-column align="center" prop="webServerRedirectUri" label="回调地址" />
      <el-table-column align="center" label="自动认证" width="80">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.autoapprove === 'false'" type="warning">否</el-tag>
          <el-tag v-else>是</el-tag>
        </template>
      </el-table-column>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="600px" :before-close="dialogClose">
      <el-form :model="form" :rules="rules" ref="form" label-width="120px">
        <el-form-item label="客户端ID" prop="clientId">
          <el-input v-model="form.clientId" placeholder="请输入客户端ID" clearable></el-input>
        </el-form-item>
        <el-form-item label="客户端密钥" prop="clientSecret">
          <el-input v-model="form.clientSecret" placeholder="请输入客户端密钥" clearable></el-input>
        </el-form-item>
        <el-form-item label="Scopes" prop="scope">
          <el-checkbox-group v-model="scope">
            <el-checkbox label="read"></el-checkbox>
            <el-checkbox label="write"></el-checkbox>
            <el-checkbox label="server"></el-checkbox>
            <el-checkbox label="client"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="授权模式" prop="authorizedGrantTypes">
          <el-checkbox-group v-model="authorizedGrantTypes">
            <el-checkbox label="password"></el-checkbox>
            <el-checkbox label="refresh_token"></el-checkbox>
            <el-checkbox label="authorization_code"></el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="自动认证" prop="autoapprove">
          <el-radio-group v-model="form.autoapprove" size="small">
            <el-radio label="true">是</el-radio>
            <el-radio label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="回调地址" prop="webServerRedirectUri">
          <el-input v-model="form.webServerRedirectUri" placeholder="请输入回调地址" clearable></el-input>
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
import { fetchList, addObj, putObj, delObj } from '@/api/client'
import { validatenull } from '@/libs/validate'
export default {
  name: 'client',
  data () {
    return {
      tableData: [],
      page: {
        total: 0, // 总页数
        currentPage: 1, // 当前页数
        pageSize: 20 // 每页显示多少条
      },
      tableLoading: false,
      tableKey: 0,
      dialogStatus: '',
      dialogFormVisible: false,
      textMap: {
        update: '编辑客户端',
        create: '新增客户端'
      },
      form: {
        scope: [],
        authorizedGrantTypes: []
      },
      rules: {
        clientId: [
          {
            required: true,
            message: '请输入客户端ID',
            trigger: 'blur'
          }
        ],
        clientSecret: [
          {
            required: true,
            message: '请输入客户端密钥',
            trigger: 'blur'
          }
        ],
        autoapprove: [
          {
            required: true,
            message: '请选择自动认证',
            trigger: 'change'
          }
        ]
      },
      authorizedGrantTypes: [],
      scope: []
    }
  },
  created () {
    this.getList()
  },
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
        this.form = {
          scope: [],
          authorizedGrantTypes: []
        }
      }
      this.dialogFormVisible = true
      this.dialogStatus = 'create'
    },
    handleEdit (row, index) {
      this.form = row
      this.scope = row.scope.split(',')
      this.authorizedGrantTypes = row.authorizedGrantTypes.split(',')
      this.dialogFormVisible = true
      this.dialogStatus = 'update'
    },
    rowDel: function (row, index) {
      var _this = this
      this.$confirm('是否确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function () {
        delObj(row.clientId).then(data => {
          _this.getList()
          _this.$message({
            showClose: true,
            message: '删除成功',
            type: 'success'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    handleUpdate: function () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (validatenull(this.authorizedGrantTypes)) {
            this.$message({
              showClose: true,
              message: '请选择授权模式',
              type: 'warning'
            })
            return
          }
          if (validatenull(this.scope)) {
            this.$message({
              showClose: true,
              message: '请选择scope',
              type: 'warning'
            })
            return
          }
          this.form.authorizedGrantTypes = this.authorizedGrantTypes.join(',')
          this.form.scope = this.scope.join(',')
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
    handleSave: function () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (validatenull(this.authorizedGrantTypes)) {
            this.$message({
              showClose: true,
              message: '请选择授权模式',
              type: 'warning'
            })
            return
          }
          if (validatenull(this.scope)) {
            this.$message({
              showClose: true,
              message: '请选择scope',
              type: 'warning'
            })
            return
          }
          this.form.authorizedGrantTypes = this.authorizedGrantTypes.join(',')
          this.form.scope = this.scope.join(',')
          addObj(this.form).then(data => {
            this.$refs.form.resetFields()
            this.getList()
            this.dialogFormVisible = false
            this.$message({
              showClose: true,
              message: '添加成功',
              type: 'success'
            })
          })
        }
      })
    },
    dialogClose (done) {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
        this.form = {
          scope: [],
          authorizedGrantTypes: []
        }
      }
      this.scope = []
      this.authorizedGrantTypes = []
      this.getList()
      done()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
