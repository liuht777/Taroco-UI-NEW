<template>
  <d2-container>
    <!-- header 查询条件 -->
    <template slot="header">
      <el-form
        :inline="true"
        :model="listQuery"
        size="mini"
        style="margin-bottom: -18px;">
          <el-form-item label="权限标识" prop="code">
            <el-input @keyup.enter.native="handleFilter" style="width: 200px;" v-model="listQuery.code" clearable>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="default" @click="handleFilter" icon="el-icon-search">搜 索</el-button>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button @click="handleCreate('form')" type="primary" icon="el-icon-plus">新 增</el-button>
          </el-form-item>
      </el-form>
    </template>
    <!-- table表格 -->
    <el-table :key='tableKey'
              :data="list"
              v-loading="listLoading"
              element-loading-text="拼命加载中..."
              highlight-current-row
              stripe
              style="width: 100%">

      <el-table-column align="center" label="序号" width="60">
        <template slot-scope="scope">
          <span>{{scope.row.id}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="权限名称">
        <template slot-scope="scope">
          <span>
            {{scope.row.name}}
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="权限标识">
        <template slot-scope="scope">
          <span>
            {{scope.row.code}}
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="备注">
        <template slot-scope="scope">
          <span>{{scope.row.remarks}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | parseTime('{y}-{m}-{d} {h}:{i}')}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleUpdate(scope.row)" icon="el-icon-edit"></el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)" icon="el-icon-delete"></el-button>
        </template>
      </el-table-column>

    </el-table>
    <!-- footer 分页条 -->
    <template slot="footer">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="listQuery.page"
          :page-sizes="[10,20,30,50]"
          :page-size="listQuery.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="margin: -10px;">
        </el-pagination>
    </template>
    <!-- 新增用户弹框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="400px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="form.code" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input type="textarea" v-model="form.remarks"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel('form')" icon="el-icon-close">取 消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')" icon="el-icon-check">确 定</el-button>
        <el-button v-else type="primary" @click="update('form')" icon="el-icon-check">修 改</el-button>
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
import { fetchList, getObj, addObj, putObj, delObj } from '@/api/auth'
export default {
  name: 'auth_list',
  data () {
    return {
      list: null,
      total: null,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10
      },
      form: {
        name: undefined,
        code: undefined,
        remarks: undefined
      },
      rules: {
        name: [
          {
            required: true,
            message: '请输入权限名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 50,
            message: '长度在 2 到 50 个字符',
            trigger: 'blur'
          }
        ],
        code: [
          {
            required: true,
            message: '请输入权限标识',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 50,
            message: '长度在 3 到 50 个字符',
            trigger: 'blur'
          },
          {
            trigger: 'blur',
            validator: (rule, value, callback) => {
              const reg = /^[a-zA-Z]+$/
              if (!reg.test(value)) {
                callback(new Error('只能输入英文大小写字母'))
              } else {
                callback()
              }
            }
          }
        ],
        remarks: [
          {
            min: 3,
            max: 255,
            message: '长度在 3 到 255 个字符',
            trigger: 'blur'
          }
        ]
      },
      statusOptions: ['0', '1'],
      dialogFormVisible: false,
      userAdd: false,
      userUpd: false,
      userDel: false,
      dialogStatus: '',
      textMap: {
        update: '编辑权限',
        create: '新增权限'
      },
      tableKey: 0
    }
  },
  created () {
    this.getList()
  },
  methods: {
    getList () {
      this.listLoading = true
      fetchList(this.listQuery).then(({data}) => {
        if (data.status === 'SUCCEED') {
          this.list = data.result.records
          this.total = data.result.total
        }
      }).finally(() => {
        this.listLoading = false
      })
    },
    handleFilter () {
      this.listQuery.page = 1
      this.getList()
    },
    handleSizeChange (val) {
      this.listQuery.limit = val
      this.getList()
    },
    handleCurrentChange (val) {
      this.listQuery.page = val
      this.getList()
    },
    handleCreate (formName) {
      this.form = {}
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    handleUpdate (row) {
      getObj(row.id).then(({data}) => {
        if (data.status === 'SUCCEED') {
          this.form = data.result
          this.dialogFormVisible = true
          this.dialogStatus = 'update'
        }
      })
    },
    create (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          addObj(this.form).then(({data}) => {
            if (data.status === 'SUCCEED') {
              this.getList()
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            }
          })
            .finally(() => {
              this.dialogFormVisible = false
            })
        }
      })
    },
    cancel (formName) {
      this.dialogFormVisible = false
      this.$refs[formName].resetFields()
    },
    update (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          putObj(this.form)
            .then(({data}) => {
              if (data.status === 'SUCCEED') {
                this.getList()
                this.$notify({
                  title: '成功',
                  message: '修改成功',
                  type: 'success',
                  duration: 2000
                })
              }
            })
            .finally(() => {
              this.dialogFormVisible = false
            })
        }
      })
    },
    handleDelete (row) {
      this.$confirm(
        '此操作将永久删除该权限(权限标识:' + row.code + '), 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        delObj(row.id)
          .then(({data}) => {
            if (data.status === 'SUCCEED') {
              this.getList()
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
            }
          })
      })
    }
  }
}
</script>
