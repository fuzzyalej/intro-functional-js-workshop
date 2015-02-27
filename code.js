function cell(value) {
  return {
    value: value,
    next: null //null is cool
  };
}

function cons(value, list) {
  var tmp = cell(value);
  tmp.next = list || null;
  return tmp;
}

function list() {
  if(arguments[0] === undefined) return null;
  var args = Array.prototype.slice.call(arguments),
  head = args[0],
  tail = args.slice(1);
  return cons(head, list.apply(this, tail));
}

function first(list) {
  if(list === null) return null;
  return list.value;
}
var car = first;
var head = first;

function rest(list) {
  if(list === null) return null;
  return list.next;
}
var cdr = rest;
var tail = rest;

function last(list) {
  if(rest(list) === null) return first(list);
  return last(rest(list));
}

function length(list) {
  if(list === null) return 0;
  return 1 + length(rest(list));
}

function replace_first(value, list) {
  return cons(value, rest(list));
}

function nth(position, list) {
  if(position > length(list) || position < 1) return null;
  if(position === 1) return first(list);
  return nth(position-1, rest(list));
}

function listp(input) {
  if(input === null) return null;
  return (typeof(input) === 'object')
  && input.hasOwnProperty('value')
  && input.hasOwnProperty('next');
}

function atomp(input) { return !listp(input); }

function nullp(input) { return input === null; }

function predicatep(input) { return input === true || input === false; }

function not(predicate) { return !!!predicate; }

function print(list) {
  if(list === null) return '';
  if(listp(first(list))) return '(' + print(first(list)) + '' + print(rest(list)) + ')';
  return ('' + first(list) + ' ' + print(rest(list)));
}

function append(list1, list2) {
  if(not(listp(list1)) && not(listp(list2))) return null;

  if(rest(list1) === null) { return cons(first(list1), list2); }
  return cons(first(list1), append(rest(list1), list2));
}

function reverse(list) {
  if(not(listp(list))) return null;
  if(rest(list) === null) return cell(first(list)); //!
  return append(reverse(rest(list)), cell(first(list)));
}

function remove(value, list) {
  if(not(listp(list))) return null;
  if(first(list) === value) return remove(value, rest(list));
  return cons(first(list), remove(value, rest(list)));
}

function map(list, fn) {
  if(not(listp(list))) return null;
  return cons(fn(first(list)), map(rest(list), fn));
}

function filter(list, predicatefn) {
  if(not(listp(list))) return null;
  if(predicatefn(first(list))) {
    return cons(first(list), filter(rest(list), predicatefn));
  } else {
    return filter(rest(list), predicatefn);
  }
}

function count(predicate, list) {
  return length(filter(list, predicate));
}

function find(list, predicatefn) {
  return first(filter(list, predicatefn));
}

function reduce(list, initial_value, fn) {
  if(list === null) return initial_value;
  return reduce(rest(list), fn(initial_value, first(list)), fn);
}
var fold = reduce;

function reduceRight(list, initial_value, fn) {
  if(list === null) return initial_value;
  return fn(reduceRight(rest(list), initial_value, fn), first(list));
}
var foldR = reduceRight;

function every(list, fn) {
  return reduce(list, true, function(acc, el) {
    return acc && fn(el);
  });
}

function any(list, fn) {
  return reduce(list, false, function(acc, el) {
    return acc || fn(el);
  });
}

function partition(list, fn) {
  return(function recurr(group1, group2, list, fn){
    if(fn(list.value)) {
      group1.push(list.value);
    } else {
      group2.push(list.value);
    }

    if(list.next === null) return;

    recurr(group1, group2, list.next, fn);
    return [group1, group2];
  }([], [], list, fn));
}

function groupBy(list, fn) {
  return(function recurr(groups, list, fn){
    result = fn(list.value);
    (groups[result] = groups[result] || []).push(list.value);

    if(list.next === null) return groups;

    recurr(groups, list.next, fn);
    return groups;
  }({}, list, fn));
}

function memoize(fn) {
  var cache = {};
  return function(argument) {
    cache[argument] = cache[argument] || fn(argument);
    return cache[argument];
  };
}

function partial(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var args2 = Array.prototype.slice.call(arguments);
    return fn.apply(this, args.concat(args2));
  };
}

function curry(fn) {
  n = fn.length;

  function stillCurrying(prev) {
    return function(arg) {
      var args = prev.concat(arg);
      if (args.length < n) {
        return stillCurrying(args);
      } else {
        return fn.apply(this, args);
      }
    };
  }
  return stillCurrying([]);
}

function fork(predicate, f, g) {
  return function() {
    if(predicate.apply(null, arguments))
      return f.apply(null, arguments);
    else
      return g.apply(null, arguments);
  };
}

function serial(f, g) {
  return function() {
    f.apply(null, arguments);
    g.apply(null, arguments);
  };
}
