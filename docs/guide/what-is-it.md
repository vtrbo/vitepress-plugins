# What Is It

<RunCode language="ts" :dependency="`
function groupBy<T>(list: T[], fn: (single: T) => any): Map<string, T[]> {
  const map = new Map<string, T[]>()
  list.forEach((s: T) => {
    const key = fn(s)
    map.set(key, map.get(key) || [])
    map.get(key)!.push(s)
  })
  return map
}`">

```ts
interface Person {
  name: string
  age: number
  grade: string
}

const list: Person[] = [
  { name: '小明', age: 2, grade: '小一班' },
  { name: '小张', age: 5, grade: '大二班' },
  { name: '小夏', age: 3, grade: '中一班' },
  { name: '小王', age: 3, grade: '小一班' },
  { name: '小李', age: 4, grade: '中一班' },
]

return groupBy(list, (single: Person) => single.grade)
```

</RunCode>
