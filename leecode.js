// 移动零

// 输入: [0,1,0,3,12]
// 输出: [1,3,12,0,0]
var moveZeroes = function (nums) {
    let len = nums.length;
    let k = 0;
    for (let i = 0; i < len; i++) {
        if (nums[i] !== 0) {
            nums[k++] = nums[i]
        }
    }
    for (let i = k; i < len - 1; i++) {
        nums[i] = 0;
    }
    return nums
};

/*两数之和
nums = [2, 7, 11, 15], target = 9
返回 [0, 1]*/

var twoSum = function (nums, target) {
    let len = nums.length;
    let result = [null, null]
    for (let i = 0; i < len; i++) {
        let otherItem = target - nums[i]
        for (let k = i + 1; k < len; k++) {
            if (nums[k] == otherItem) {
                result[0] = i;
                result[1] = k
            }
        }
    }
    return result
};

/* 有效的数独
条件一:数字 1-9 在每一行只能出现一次。
条件二:数字 1-9 在每一列只能出现一次。
条件三:数字 1-9 在每一个以粗实线分隔的 3x3 宫内只能出现一次。*/


var isValidSudoku = function (board) {
    let row = Array.from({
        length: 9
    }, () => [])
    col = Array.from({
            length: 9
        }, () => []),
        minboard = Array.from({
            length: 10
        }, () => [])
    let len = board.length;
    let k = 0
    let i = 0
    for (k = 0; k < 9; k++) {
        for (i = 0; i < 9; i++) {
            let nowNums = board[i][k];
            let box_index = 3 * (Math.floor(k / 3)) + Math.floor(i / 3);
            if (nowNums !== '.') {
                if (row[i] && row[i][nowNums]) { // 条件二
                    return false
                } else {
                    row[i][nowNums] = nowNums
                }
                if (col[k] && col[k][nowNums]) { // 条件一  
                    return false
                } else {
                    col[k][nowNums] = nowNums
                }
                if (minboard[box_index][nowNums]) {
                    // 条件三          
                    return false
                } else {
                    minboard[box_index][nowNums] = nowNums
                }
            }
        }
    }


    return true
};



/*
    给定一个 n × n 的二维矩阵表示一个图像。

将图像顺时针旋转 90 度。

给定 matrix = 
[
  [1,2,3],
  [4,5,6],
  [7,8,9]
],

原地旋转输入矩阵，使其变为:
[
  [7,4,1],
  [8,5,2],
  [9,6,3]
]
*/
// [0, 0] => [0, 2]
// [0, 1] => [1, 2]
// [0, 2] => [2, 2]

var rotate = function (matrix) {

};


function arrfunc() {
    var arr = []
    for (var index = 0; index < 10; index++) {
        arr[index] = (function (i) {
            return function () {
                return i
            }
        })(index)

    }
    return arr

}
console.log(arrfunc()[0]())