<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <el-table
        :data="cateList"
        style="width: 100%;margin-bottom: 20px;"
        row-key="cat_id"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称" sortable>
        </el-table-column>
        <el-table-column label="是否有效" width="180">
          <template v-slot="scope">
            <i
              v-if="!scope.row.cat_deleted"
              class="el-icon-success"
              style="color: lightgreen"
            ></i>
            <i v-else class="el-icon-error" style="color: red"></i>
          </template>
        </el-table-column>
        <el-table-column label="排序">
          <template v-slot="scope">
            <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
            <el-tag
              v-else-if="scope.row.cat_level === 1"
              type="success"
              size="mini"
              >二级</el-tag
            >
            <el-tag v-else type="warning" size="mini">三级</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="editCate(scope.row.cat_id)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="deleteCate(scope.row.cat_id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        ref="addCateFormRef"
        :rules="addCateFormRules"
        :model="addCateForm"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- option用来指定数据源 -->
          <el-cascader
            v-model="selectParentCateList"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑商品分类名称的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDIalogClosed"
    >
      <!-- 修改分类的表单 -->
      <el-form
        ref="editCateFormRef"
        :rules="editCateFormRules"
        :model="editCateForm"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类的数据列表
      cateList: [],
      //总分类数量
      total: 0,
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      addCateForm: {
        //将要添加的分类名称
        cat_name: "",
        //父级分类id
        cat_pid: 0,
        // 分类等级
        cat_level: 0
      },
      //添加分类时规则校验
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入要添加的分类名称", trigger: "blur" }
        ]
      },
      //父级分类列表
      parentCateList: [],
      //选中的父级分类id
      selectParentCateList: [],
      //级联选择器配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true
      },
      //修改分类名称对话框控制属性
      editCateDialogVisible: false,
      //修改分类名称数据
      editCateForm: {
        cat_id: "",
        cat_name: ""
      },
      //修改分类名称校验规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类失败");
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    //监听pagesize的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //展示添加商品分类对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表，再展示出对话框
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取数据分类失败");
      this.parentCateList = res.data;
    },
    //级联选择器改变时触发
    parentCateChanged() {
      console.log(this.selectParentCateList);
      if (this.selectParentCateList.length > 0) {
        //   获取父级分类的id
        this.addCateForm.cat_pid = this.selectParentCateList[
          this.selectParentCateList.length - 1
        ];
        this.addCateForm.cat_level = this.selectParentCateList.length;
        return;
      }
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    //点击按钮，添加新分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) return this.$message.error("添加分类失败");
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 监听对话框的关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectParentCateList = [];
      this.addCateForm.cat_pid = this.addCateForm.cat_level = 0;
    },
    //根据id值编辑商品分类名字
    async editCate(id) {
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200)
        return this.$message.error("获取当前分类名称失败");
      this.editCateForm.cat_id = res.data.cat_id;
      this.editCateForm.cat_name = res.data.cat_name;
      this.editCateDialogVisible = true;
    },
    //监听修改分类名称对话框关闭行为
    editCateDIalogClosed() {
      this.$refs.editCateFormRef.resetFields();
    },
    editCateSubmit() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        );
        if (res.meta.status !== 200)
          return this.$message.error("修改分类名称失败");
        this.$message.success("修改分类名称成功");
        this.getCateList();
        this.editCateDialogVisible = false;
      });
    },
    //根据id值删除商品分类
    async deleteCate(id) {
      const resConfirm = await this.$confirm(
        "此操作将永久删除该分类，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => {
        return err;
      });
      if (resConfirm !== "confirm") return this.$message.info("已取消删除");
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除分类失败");
      this.$message.success("删除分类成功");
      this.getCateList();
    }
  }
};
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>