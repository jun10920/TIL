const arr = ['가', '라', '다', '라', '마', '라'];

while (true) {
  arr.splice(arr.indexOf('라'), 1);
  if (arr.indexOf('라') === -1) break;
}

for (let i = 0; i < arr.length; i++) console.log(arr[i]);
