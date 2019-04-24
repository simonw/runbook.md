# boast

**B**iz-**O**ps **A**bstract **S**yntax **T**ree.

--

**boast** is the specification for representing a biz-ops runbook in a
[syntax tree](https://github.com/syntax-tree/unist#syntax-tree). It implements the [unist](https://github.com/syntax-tree/unist) spec, and is a superset of the [mdast](https://github.com/syntax-tree/mdast) spec.

## Introduction

This document defines the format for representing a biz-ops runbook as a [Markdown](https://daringfireball.net/projects/markdown/) file.

## Nodes

### `Parent`

```idl
interface Parent <: UnistParent {
  children: [Content]
}
```

**Parent** ([**UnistParent**][https://github.com/syntax-tree/unist#parent]) represents a node in boast
containing other nodes (said to be [_children_][term-child]).

Its direct descendancy is limited to only other boast nodes.

### `Literal`

```idl
interface Literal <: UnistLiteral {
  value: string
}
```

**Literal** ([**UnistLiteral**][https://github.com/syntax-tree/unist#literal]) represents a node in mdast
containing a value.

Its `value` field is a `string`.

### `Root`

```idl
interface Root <: Parent {
  type: "root"
}
```

**Root** ([**Parent**](#parent)) represents a document.

**Root** can be used as the [_root_](https://github.com/syntax-tree/unist#root)
of a [_tree_](https://github.com/syntax-tree/unist#tree), never as a
[_child_](https://github.com/syntax-tree/unist#child). It may contain only 1
[Name](#name), 0 or 1 [Description](#description) and many
[Property](#property).

### `Name`

```idl
interface Name <: Literal {
  type: "name"
}
```

**Name** ([**Literal**](#literal)) represents the `name` property in a biz-ops
runbook.

### `Subdocument`

**Subdocument** ([**Parent**](#parent)) represents an mdast sub-document. Its
children are limited to a single
[mdast Root](https://github.com/syntax-tree/mdast#root) node

For example, the following markdown:

```md
# Big Monkey
```

Yields:

```js
{type: "name", value: "Big Monkey"}
```

### `Description`

```idl
interface Description <: Subdocument {
  type: "description",
  children: [mdast Root]
}
```

**Description** ([**Subdocument**](#subdocument)) represents the `description`
property in a biz-ops runbook.

```md
# Big Monkey

Big monkey coming, better watch out.

## Something else
```

Yields, for description:

```js
{
  type: "description",
  children: [{
    type: "root",
    children: [{
      type: "text",
      value: "Big monkey coming, better watch out."
    }]
}
```

### `Property`

```idl
interface Property <: Subdocument {
  type: "property",
  children: [mdast Root]
}
```

**Property** ([**Subdocument**](#subdocument)) represents a
property in a biz-ops runbook.

For example, the following markdown:

```md
## Contains big monkeys

Yes
```

Yields:

```js
{
  type: "property",
  value: "Contains big monkeys",
  children: [{
    type: "root",
    children: [{
      type: "paragraph",
      children: [{
        type: "text",
        value: "Yes"
      }]
    }]
}
```
