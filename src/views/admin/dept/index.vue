<template>
  <d2-container>
    <!-- header 查询条件 -->
    <template slot="header">
      <el-button size="mini" type="default" @click="getList" icon="el-icon-refresh">刷 新</el-button>
      <div style="float: right">
        <el-button size="mini" type="primary" @click="handlerAdd" icon="el-icon-plus">新 增</el-button>
      </div>
    </template>
    <tree-table :data="treeData">
     <el-table-column label="名称">
      <template slot-scope="scope">
        <span>{{ scope.row.name }}</span>
      </template>
     </el-table-column>
     <el-table-column label="排序">
      <template slot-scope="scope">
        <span>{{ scope.row.orderNum }}</span>
      </template>
     </el-table-column>
     <el-table-column label="操作" width="160">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="handlerEdit(scope.row.id)"></el-button>
          <el-button size="mini" type="danger" @click="handlerDelete(scope.row.id)" icon="el-icon-delete"></el-button>
        </template>
      </el-table-column>
    </tree-table>
    <!-- 新增弹框 -->
    <el-dialog title="新增/编辑部门" :visible.sync="dialogFormVisible" width="400px">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="上级部门" prop="parentId">
          <el-select v-model="form.parentId" placeholder="不选默认顶级部门" style="width:100%" :disabled="isEdit">
            <el-option label="顶级部门" :value="0" />
            <el-option
              v-for="item in listAll"
              :key="item.deptId"
              :label="item.name"
              :value="item.deptId">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="form.name" placeholder="最多输入50个字符"></el-input>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input v-model.number="form.orderNum" placeholder="只能输入正整数, 最大999"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="onCancel" icon="el-icon-close">取 消</el-button>
        <el-button type="primary" @click="submit" icon="el-icon-check">确 定</el-button>
      </div>
    </el-dialog>
  </d2-container>
</template>

<script>
import { listAll, fetchTree, getObj, addObj, delObj, putObj } from '@/api/dept'
export default {
  name: 'department',
  data () {
    const validateSort = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      if (!Number.isInteger(value)) {
        callback(new Error('请输入数字值'))
      } else {
        if (value < 1 || value > 999) {
          callback(new Error('大小在 1 到 999 之间'))
        } else {
          callback()
        }
      }
    }
    return {
      dialogFormVisible: false,
      isEdit: false,
      listAll: [],
      treeData: [],
      form: {
        name: undefined,
        orderNum: 99,
        parentId: undefined,
        deptId: undefined
      },
      rules: {
        name: [
          { required: true, message: '请输入部门名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
        ],
        orderNum: [
          { validator: validateSort, trigger: 'blur' }
        ]
      }
    }
  },
  filters: {
    typeFilter (type) {
      const typeMap = {
        0: '菜单',
        1: '按钮'
      }
      return typeMap[type]
    }
  },
  created () {
    this.getList()
  },
  methods: {
    getAllList () {
      listAll().then(response => {
        this.listAll = response.data
      })
    },
    getList () {
      fetchTree().then(response => {
        this.treeData = response.data
      })
    },
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.form.parentId) {
            this.form.parentId = 0
          }
          if (!this.form.deptId) {
            this.create()
          } else {
            this.update()
          }
        }
      })
    },
    handlerEdit (id) {
      getObj(id).then((data) => {
        this.form = data.data
        this.getAllList()
        this.isEdit = true
        this.dialogFormVisible = true
      })
    },
    handlerAdd () {
      this.getAllList()
      this.resetForm()
      this.isEdit = false
      this.dialogFormVisible = true
    },
    handlerDelete (id) {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        delObj(id).then(({data}) => {
          if (data.status && data.status === 'FAILED') {
            return
          }
          this.getList()
          this.resetForm()
          this.onCancel()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    update () {
      putObj(this.form).then(() => {
        this.onCancel()
        this.getList()
        this.$notify({
          title: '成功',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    create () {
      addObj(this.form).then(() => {
        this.onCancel()
        this.getList()
        this.$notify({
          title: '成功',
          message: '创建成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    onCancel () {
      this.dialogFormVisible = false
      this.resetForm()
    },
    resetForm () {
      if (this.$refs.form) {
        this.$refs.form.resetFields()
      }
    }
  }
}
</script>
